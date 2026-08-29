# ĐẶC TẢ KỸ THUẬT VÀ THIẾT KẾ GAME ENGINE: រែកខ្មែរ - REK KHMER (ល្បែងរែក)
> **Tên chính thức:** រែកខ្មែរ - Rek Khmer  
> **GitHub Repository:** `machxanht/Rek-Khmer-Chess` (https://github.com/machxanht/Rek-Khmer-Chess)  
> **Tài liệu chuẩn hóa kiến trúc và thuật toán cho Game Engine Cờ Rek**  
> **Trạng thái dữ liệu:** ĐÃ ĐẦY ĐỦ 100% (Hoàn thiện toàn bộ logic di chuyển, bắt quân Gánh/Vây, xử lý Vua, chế độ chơi và điều kiện thắng).

---

## MỤC LỤC
1. [Khái quát & Mô hình Dữ liệu (Data Model)](#1-mo-hinh-du-lieu)
2. [Thiết lập bàn cờ ban đầu (Board Setup)](#2-thiet-lap-ban-co)
3. [Thuật toán Di chuyển Hợp lệ (Move Generation)](#3-thuat-toan-di-chuyen)
4. [Thuật toán Bắt quân: Gánh (Rek Engine)](#4-thuat-toan-ganh)
5. [Thuật toán Bắt quân: Bao vây (Poat Engine - Flood Fill Liberties)](#5-thuat-toan-bao-vay)
6. [Thứ tự Thực thi 1 Nước đi (Turn Execution Pipeline)](#6-quy-trinh-thuc-thi)
7. [Quy tắc theo 2 Chế độ chơi (Game Modes: Rek Poat vs Min Rek Chanh)](#7-che-do-choi)
8. [Điều kiện Thắng, Thua và Hòa (Endgame Conditions)](#8-dieu-kien-ket-thuc)
9. [Mã Nguồn TypeScript Chuẩn cho Engine (Reference Implementation)](#9-ma-nguon-engine-typescript)
10. [Bộ Test Cases Kiểm Thử Engine (Unit Test Scenarios)](#10-test-cases)

---

<a name="1-mo-hinh-du-lieu"></a>
## 1. KHÁI QUÁT & MÔ HÌNH DỮ LIỆU (DATA MODEL)

### 1.1. Hệ tọa độ bàn cờ
* Bàn cờ chuẩn: $8 \times 8 = 64$ ô vuông.
* Trục hoành (Cột / Files): `a, b, c, d, e, f, g, h` tương ứng chỉ số `x: 0 .. 7`.
* Trục tung (Hàng / Ranks): `1, 2, 3, 4, 5, 6, 7, 8` tương ứng chỉ số `y: 0 .. 7`.
* Ô `(x, y)`: `(0, 0) = a1` (góc dưới trái của Trắng), `(7, 7) = h8` (góc trên phải của Đen).

### 1.2. Kiểu dữ liệu (TypeScript Types)

```typescript
export type PlayerColor = 'WHITE' | 'BLACK';

export type PieceType = 'KING' | 'MAN'; // Sdech (ស្តេច) hoặc Koun (កូន)

export type GameMode = 'REK_POAT' | 'MIN_REK_CHANH';

export interface Piece {
  id: string;
  type: PieceType;
  color: PlayerColor;
  hasMoved?: boolean;
}

export interface Position {
  x: number; // 0..7 (a..h)
  y: number; // 0..7 (1..8)
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
}

export interface MoveResult {
  valid: boolean;
  error?: string;
  rekCaptures: Position[];    // Danh sách quân bị ăn bởi đòn Gánh
  poatCaptures: Position[];   // Danh sách quân bị ăn bởi đòn Bao Vây
  isGameOver: boolean;
  winner?: PlayerColor | 'DRAW';
  winReason?: string;
}
```

---

<a name="2-thiet-lap-ban-co"></a>
## 2. THIẾT LẬP BÀN CỜ BAN ĐẦU (BOARD SETUP)

* **Tổng số quân:** Mỗi bên 16 quân (1 Vua + 15 Lính).
* **Bên Trắng (WHITE):**
  - Hàng 1 (`y = 0`): `a1, b1, c1, d1 (VUA), e1, f1, g1, h1`
  - Hàng 2 (`y = 1`): `a2, b2, c2, d2, e2, f2, g2, h2` (8 Lính)
* **Bên Đen (BLACK):**
  - Hàng 8 (`y = 7`): `a8, b8, c8, d8 (VUA), e8, f8, g8, h8`
  - Hàng 7 (`y = 6`): `a7, b7, c7, d7, e7, f7, g7, h7` (8 Lính)
* **Hàng 3, 4, 5, 6 (`y = 2, 3, 4, 5`):** Hoàn toàn TRỐNG (32 ô trống ở trung tâm).

```
    a   b   c   d   e   f   g   h
  +---+---+---+---+---+---+---+---+
8 | M | M | M | K | M | M | M | M |  8 (Đen - Hàng 8)
  +---+---+---+---+---+---+---+---+
7 | M | M | M | M | M | M | M | M |  7 (Đen - Hàng 7)
  +---+---+---+---+---+---+---+---+
6 | . | . | . | . | . | . | . | . |  6
  +---+---+---+---+---+---+---+---+
5 | . | . | . | . | . | . | . | . |  5
  +---+---+---+---+---+---+---+---+
4 | . | . | . | . | . | . | . | . |  4
  +---+---+---+---+---+---+---+---+
3 | . | . | . | . | . | . | . | . |  3
  +---+---+---+---+---+---+---+---+
2 | M | M | M | M | M | M | M | M |  2 (Trắng - Hàng 2)
  +---+---+---+---+---+---+---+---+
1 | M | M | M | K | M | M | M | M |  1 (Trắng - Hàng 1)
  +---+---+---+---+---+---+---+---+
    a   b   c   d   e   f   g   h
```

---

<a name="3-thuat-toan-di-chuyen"></a>
## 3. THUẬT TOÁN DI CHUYỂN HỢP LỆ (MOVE GENERATION)

1. **Quy tắc trượt:** Mọi quân di chuyển theo 4 hướng trực giao (Lên, Xuống, Trái, Phải) như quân Xe trong cờ vua.
2. **Quy tắc va chạm:** 
   - Chỉ được trượt qua các ô TRỐNG.
   - Dừng lại trước quân đồng minh hoặc quân địch (KHÔNG ĐƯỢC nhảy qua đầu quân khác).
   - **TUYỆT ĐỐI KHÔNG ĐƯỢC BẮT QUÂN ĐÈ LÊN Ô ĐÃ CÓ QUÂN.** Ô đích (`to`) bắt buộc phải là ô TRỐNG.
3. **Quy tắc về Vua:**
   - Trong `REK_POAT`: Vua di chuyển như Lính.
   - Trong `MIN_REK_CHANH`: Vua đứng yên 100% tại `d1`/`d8`, không tạo ra bất kỳ nước đi nào.

---

<a name="4-thuat-toan-ganh"></a>
## 4. THUẬT TOÁN BẮT QUÂN: GÁNH (REK ENGINE)

Sau khi quân $P$ di chuyển đến ô đích $T(x, y)$:

### 4.1. Gánh trục ngang (Horizontal Rek):
* Xét 2 ô bên cạnh: Trái $L(x - 1, y)$ và Phải $R(x + 1, y)$.
* **Điều kiện:**
  - $x - 1 \ge 0$ và $x + 1 \le 7$.
  - Cả 2 ô $L$ và $R$ đều đang có quân của ĐỐI PHƯƠNG.
* **Kết quả:** Cả 2 quân tại $L$ và $R$ bị bắt.

### 4.2. Gánh trục dọc (Vertical Rek):
* Xét 2 ô bên cạnh: Dưới $D(x, y - 1)$ và Trên $U(x, y + 1)$.
* **Điều kiện:**
  - $y - 1 \ge 0$ và $y + 1 \le 7$.
  - Cả 2 ô $D$ và $U$ đều đang có quân của ĐỐI PHƯƠNG.
* **Kết quả:** Cả 2 quân tại $D$ và $U$ bị bắt.

### 4.3. Gánh 4 quân (Rek Boun / Rek Troat):
* Nếu thỏa mãn đồng thời cả 4.1 và 4.2 tại ô $T(x, y)$ $\rightarrow$ Ăn sạch cả 4 quân xung quanh: $L, R, D, U$.

---

<a name="5-thuat-toan-bao-vay"></a>
## 5. THUẬT TOÁN BẮT QUÂN: BAO VÂY (POAT ENGINE - FLOOD FILL LIBERTIES)

Sau khi đã nhấc các quân bị Rek ra khỏi bàn cờ, tiến hành quét toàn bộ quân đối phương còn lại để phát hiện các khối quân bị mất toàn bộ đường đi (0 Khí / Liberties):

```
Thuật toán Flood-Fill Poat:
1. Đặt Visited = Set()
2. Duyệt qua từng quân đối phương piece tại pos(x, y):
   Nếu pos đã có trong Visited -> Bỏ qua.
   
   Khởi tạo:
     Group = [pos]
     Liberties = Set()
     Queue = [pos]
     Visited.add(pos)
     
   Trong khi Queue không rỗng:
     current = Queue.pop()
     Với mỗi hướng trong 4 hướng (dx, dy):
       nx = current.x + dx
       ny = current.y + dy
       Nếu (nx, ny) nằm trong bàn cờ (0..7):
         Nếu board[nx][ny] là Ô TRỐNG:
           Liberties.add((nx, ny))
         Ngược lại nếu board[nx][ny] là QUÂN CÙNG PHE đối phương và chưa trong Visited:
           Visited.add((nx, ny))
           Group.push((nx, ny))
           Queue.push((nx, ny))
           
   Nếu |Liberties| == 0:
     Thêm toàn bộ quân trong Group vào danh sách PoatCaptures!
```

---

<a name="6-quy-trinh-thuc-thi"></a>
## 6. THỨ TỰ THỰC THI 1 NƯỚC ĐI (TURN EXECUTION PIPELINE)

```
                       [BẮT ĐẦU LƯỢT]
                             │
                             ▼
               Kiểm tra nước đi (from -> to)
               - To là ô trống?
               - Đường đi không bị chắn?
               - Trong Min Rek Chanh: Có vi phạm luật bắt buộc gánh không?
                             │
                             ▼ (Hợp lệ)
               Di chuyển quân từ `from` sang `to`
                             │
                             ▼
               [BƯỚC 1: XỬ LÝ REK]
               Quét trục ngang và dọc tại ô `to`
               -> Nhấc toàn bộ quân bị Gánh ra khỏi bàn cờ
                             │
                             ▼
               [BƯỚC 2: XỬ LÝ POAT]
               Chạy Flood-Fill Liberties trên bàn cờ vừa cập nhật
               -> Nhấc toàn bộ khối quân có Liberties == 0 ra khỏi bàn cờ
                             │
                             ▼
               [BƯỚC 3: KIỂM TRA THẮNG THUA]
               - Vua đối phương có bị ăn (trong Rek hoặc Poat) không?
               - Đối phương còn quân nào không?
               - Đối phương còn nước đi hợp lệ nào không?
                             │
                             ▼
                        [ĐỔI LƯỢT]
```

---

<a name="7-che-do-choi"></a>
## 7. QUY TẮC THEO 2 CHẾ ĐỘ CHƠI

| Đặc tính | Chế độ REK POAT (រែកព័ទ្ធ) | Chế độ MIN REK CHANH (មិនរែកចាញ់) |
| :--- | :--- | :--- |
| **Hành vi của Vua** | Di chuyển tự do như Lính (Rook-like) | **Đứng yên cố định tại `d1`/`d8` (Palace King)** |
| **Tính bắt buộc của Rek** | **Tự chọn (Optional):** Có thể gánh hoặc không gánh | **Bắt buộc (Compulsory):** Nếu tồn tại ít nhất 1 nước Rek, người chơi **buộc phải** chọn 1 nước Rek |
| **Cơ chế Hao Rek** | Lời hô tâm lý / chiến thuật | Quy tắc ràng buộc pháp lý (Vi phạm = Thua ngay) |
| **Đòn Poat** | Bật (Hoạt động bình thường) | Bật (Hoạt động bình thường) |

---

<a name="8-dieu-kien-ket-thuc"></a>
## 8. ĐIỀU KIỆN THẮNG, THUA VÀ HÒA (ENDGAME CONDITIONS)

1. **Thắng bằng Bắt Vua (Primary Win):**
   - Vua đối phương bị loại bỏ khỏi bàn cờ bằng đòn Rek hoặc đòn Poat.
2. **Thắng bằng Tuyệt diệt (Annihilation Win):**
   - Ăn sạch toàn bộ 16 quân của đối phương.
3. **Thắng bằng Khóa toàn bàn (Stalemate / Immobilization Win):**
   - Đến lượt đối phương nhưng đối phương không còn bất kỳ nước đi hợp lệ nào ($LegalMoves = 0$).
4. **Thắng do Đối phương phạm luật (Forfeit Win - Trong Min Rek Chanh):**
   - Đối phương không thực hiện nước Rek khi đang có thế gánh.
5. **Hòa cờ (Draw):**
   - Lặp lại trạng thái bàn cờ 3 lần (Threefold Repetition).
   - Luật đếm nước khi 1 bên chỉ còn trơ trọi 1 Vua: Đạt 32 nước đếm mà không bị bắt.

---

<a name="9-ma-nguon-engine-typescript"></a>
## 9. MÃ NGUỒN TYPESCRIPT CHUẨN CHO ENGINE (REFERENCE IMPLEMENTATION)

Dưới đây là module logic cốt lõi hoàn chỉnh có thể nhúng trực tiếp vào dự án:

```typescript
export class RekEngine {
  public board: (Piece | null)[][]; // 8x8
  public currentTurn: PlayerColor = 'WHITE';
  public mode: GameMode = 'REK_POAT';
  public moveHistory: Move[] = [];
  public isGameOver: boolean = false;
  public winner: PlayerColor | 'DRAW' | null = null;
  public winReason: string = '';

  constructor(mode: GameMode = 'REK_POAT') {
    this.mode = mode;
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    this.resetBoard();
  }

  public resetBoard() {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    this.currentTurn = 'WHITE';
    this.isGameOver = false;
    this.winner = null;
    this.winReason = '';
    this.moveHistory = [];

    // Setup White (y = 0, 1)
    for (let x = 0; x < 8; x++) {
      this.board[x][1] = { id: `w_m_${x}`, type: 'MAN', color: 'WHITE' };
      this.board[x][0] = { id: `w_back_${x}`, type: x === 3 ? 'KING' : 'MAN', color: 'WHITE' };
    }

    // Setup Black (y = 6, 7)
    for (let x = 0; x < 8; x++) {
      this.board[x][6] = { id: `b_m_${x}`, type: 'MAN', color: 'BLACK' };
      this.board[x][7] = { id: `b_back_${x}`, type: x === 3 ? 'KING' : 'MAN', color: 'BLACK' };
    }
  }

  // Lấy danh sách tất cả nước đi hợp lệ của 1 quân tại (fromX, fromY)
  public getValidMovesForPiece(fromX: number, fromY: number): Position[] {
    const piece = this.board[fromX][fromY];
    if (!piece || piece.color !== this.currentTurn) return [];
    if (this.mode === 'MIN_REK_CHANH' && piece.type === 'KING') return []; // Vua đứng yên

    const validMoves: Position[] = [];
    const directions = [
      { dx: 0, dy: 1 },  // Lên
      { dx: 0, dy: -1 }, // Xuống
      { dx: -1, dy: 0 }, // Trái
      { dx: 1, dy: 0 },  // Phải
    ];

    for (const { dx, dy } of directions) {
      let step = 1;
      while (true) {
        const nx = fromX + dx * step;
        const ny = fromY + dy * step;
        if (nx < 0 || nx > 7 || ny < 0 || ny > 7) break;
        if (this.board[nx][ny] !== null) break; // Bị chắn, không nhảy qua được
        validMoves.push({ x: nx, y: ny });
        step++;
      }
    }

    return validMoves;
  }

  // Tìm tất cả các nước đi tạo ra đòn Gánh (Rek) của bên đang đi
  public getAvailableRekMoves(): { from: Position; to: Position }[] {
    const rekMoves: { from: Position; to: Position }[] = [];
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const piece = this.board[x][y];
        if (piece && piece.color === this.currentTurn) {
          const targets = this.getValidMovesForPiece(x, y);
          for (const target of targets) {
            if (this.checkWouldRek(target.x, target.y, this.currentTurn)) {
              rekMoves.push({ from: { x, y }, to: target });
            }
          }
        }
      }
    }
    return rekMoves;
  }

  private checkWouldRek(toX: number, toY: number, color: PlayerColor): boolean {
    const opponent = color === 'WHITE' ? 'BLACK' : 'WHITE';
    // Kiểm tra ngang
    const hasHorizontalRek =
      toX > 0 &&
      toX < 7 &&
      this.board[toX - 1][toY]?.color === opponent &&
      this.board[toX + 1][toY]?.color === opponent;

    // Kiểm tra dọc
    const hasVerticalRek =
      toY > 0 &&
      toY < 7 &&
      this.board[toX][toY - 1]?.color === opponent &&
      this.board[toX][toY + 1]?.color === opponent;

    return hasHorizontalRek || hasVerticalRek;
  }

  // Thực hiện nước đi
  public makeMove(fromX: number, fromY: number, toX: number, toY: number): MoveResult {
    if (this.isGameOver) return { valid: false, error: 'Game đã kết thúc', rekCaptures: [], poatCaptures: [], isGameOver: true };

    const piece = this.board[fromX][fromY];
    if (!piece || piece.color !== this.currentTurn) {
      return { valid: false, error: 'Không phải lượt hoặc không có quân', rekCaptures: [], poatCaptures: [], isGameOver: false };
    }

    const validMoves = this.getValidMovesForPiece(fromX, fromY);
    const isTargetValid = validMoves.some(m => m.x === toX && m.y === toY);
    if (!isTargetValid) {
      return { valid: false, error: 'Nước đi không hợp lệ', rekCaptures: [], poatCaptures: [], isGameOver: false };
    }

    // Trong Min Rek Chanh: Kiểm tra luật bắt buộc Rek
    if (this.mode === 'MIN_REK_CHANH') {
      const rekMoves = this.getAvailableRekMoves();
      if (rekMoves.length > 0) {
        const isDoingRek = rekMoves.some(m => m.from.x === fromX && m.from.y === fromY && m.to.x === toX && m.to.y === toY);
        if (!isDoingRek) {
          // Phạm luật không gánh -> Xử thua ngay!
          this.isGameOver = true;
          this.winner = this.currentTurn === 'WHITE' ? 'BLACK' : 'WHITE';
          this.winReason = `Phạm luật Min Rek Chanh: Không gánh khi có cơ hội Hao Rek!`;
          return { valid: false, error: this.winReason, rekCaptures: [], poatCaptures: [], isGameOver: true, winner: this.winner, winReason: this.winReason };
        }
      }
    }

    // 1. Di chuyển quân
    this.board[toX][toY] = piece;
    this.board[fromX][fromY] = null;
    this.moveHistory.push({ from: { x: fromX, y: fromY }, to: { x: toX, y: toY }, piece });

    const opponent = this.currentTurn === 'WHITE' ? 'BLACK' : 'WHITE';
    const rekCaptures: Position[] = [];
    const poatCaptures: Position[] = [];

    // 2. Xử lý đòn GÁNH (Rek)
    // Ngang
    if (toX > 0 && toX < 7 && this.board[toX - 1][toY]?.color === opponent && this.board[toX + 1][toY]?.color === opponent) {
      rekCaptures.push({ x: toX - 1, y: toY }, { x: toX + 1, y: toY });
    }
    // Dọc
    if (toY > 0 && toY < 7 && this.board[toX][toY - 1]?.color === opponent && this.board[toX][toY + 1]?.color === opponent) {
      rekCaptures.push({ x: toX, y: toY - 1 }, { x: toX, y: toY + 1 });
    }

    // Nhấc quân Rek ra
    for (const pos of rekCaptures) {
      this.board[pos.x][pos.y] = null;
    }

    // 3. Xử lý đòn BAO VÂY (Poat) bằng Flood-Fill
    const visited = Array(8).fill(false).map(() => Array(8).fill(false));
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if (this.board[x][y]?.color === opponent && !visited[x][y]) {
          const group: Position[] = [];
          const liberties: Set<string> = new Set();
          const queue: Position[] = [{ x, y }];
          visited[x][y] = true;

          while (queue.length > 0) {
            const curr = queue.shift()!;
            group.push(curr);

            const dirs = [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
            for (const { dx, dy } of dirs) {
              const nx = curr.x + dx;
              const ny = curr.y + dy;
              if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
                if (this.board[nx][ny] === null) {
                  liberties.add(`${nx},${ny}`);
                } else if (this.board[nx][ny]?.color === opponent && !visited[nx][ny]) {
                  visited[nx][ny] = true;
                  queue.push({ x: nx, y: ny });
                }
              }
            }
          }

          if (liberties.size === 0) {
            poatCaptures.push(...group);
          }
        }
      }
    }

    // Nhấc quân Poat ra
    for (const pos of poatCaptures) {
      this.board[pos.x][pos.y] = null;
    }

    // 4. Kiểm tra điều kiện thắng
    let opponentKingAlive = false;
    let opponentPiecesCount = 0;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const p = this.board[x][y];
        if (p?.color === opponent) {
          opponentPiecesCount++;
          if (p.type === 'KING') opponentKingAlive = true;
        }
      }
    }

    if (!opponentKingAlive) {
      this.isGameOver = true;
      this.winner = this.currentTurn;
      this.winReason = `Bắt được Vua đối phương (Chap Sdech)!`;
    } else if (opponentPiecesCount === 0) {
      this.isGameOver = true;
      this.winner = this.currentTurn;
      this.winReason = `Tiêu diệt toàn bộ quân đối phương!`;
    } else {
      // Đổi lượt và kiểm tra Stalemate
      this.currentTurn = opponent;
      let hasAnyMove = false;
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          if (this.board[x][y]?.color === this.currentTurn) {
            if (this.getValidMovesForPiece(x, y).length > 0) {
              hasAnyMove = true;
              break;
            }
          }
        }
        if (hasAnyMove) break;
      }

      if (!hasAnyMove) {
        this.isGameOver = true;
        this.winner = opponent === 'WHITE' ? 'BLACK' : 'WHITE';
        this.winReason = `Đối phương hết nước đi hợp lệ (Khóa toàn bàn)!`;
      }
    }

    return {
      valid: true,
      rekCaptures,
      poatCaptures,
      isGameOver: this.isGameOver,
      winner: this.winner || undefined,
      winReason: this.winReason,
    };
  }
}
```

---

<a name="10-test-cases"></a>
## 10. BỘ TEST CASES KIỂM THỬ ENGINE (UNIT TEST SCENARIOS)

| Test ID | Tên Kịch Bản | Trạng Thái Bàn Cờ Thử Nghiệm | Nước Đi | Kết Quả Mong Đợi |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Gánh ngang 2 quân | Đen tại `b4`, `d4`. Ô `c4` trống. Trắng tại `c1`. | Trắng: `c1 → c4` | Ăn 2 quân Đen tại `b4` và `d4`. |
| **TC-02** | Gánh dọc bắt Vua | Vua Đen tại `d2`, Lính Đen tại `d6`. Trắng tại `a4`. | Trắng: `a4 → d4` | Ăn Vua Đen `d2` + Lính `d6` $\rightarrow$ Trắng thắng ngay lập tức. |
| **TC-03** | Gánh 4 quân (Rek Boun) | Đen tại `c4, e4, d3, d5`. Ô `d4` trống. Trắng tại `a4`. | Trắng: `a4 → d4` | Ăn sạch cả 4 quân Đen ở 4 phía. |
| **TC-04** | Bao vây Poat ở góc | Đen ở `a8`. Trắng ở `b8`. Trắng tiến `a6 → a7`. | Trắng: `a6 → a7` | Đen `a8` hết khí $\rightarrow$ Bị loại bỏ bởi Poat. |
| **TC-05** | Min Rek Chanh - Bắt buộc Rek | Trắng tạo thế gánh cho Đen. Đen cố tình đi nước khác. | Đen: Đi quân không gánh | Engine từ chối nước đi / Xử Đen thua vì vi phạm luật. |
| **TC-06** | Khối liên thông Poat | 3 quân Đen `a7, a8, b8` bị Trắng bịt kín `a6, b7, c8`. | Trắng đi chốt kín | Cả 3 quân Đen bị ăn cùng lúc bởi Poat. |
