// 7 curated Rek Khmer tactical/defense puzzles.
// Every published solution is required to be legal under the engine SPEC.

import { Cell, TacticalPuzzle } from './types'
import { idx } from './captures'

let puzzleIdCounter = 1000
const makePieceId = () => `pz_${puzzleIdCounter++}`

export const KHMER_PUZZLES: TacticalPuzzle[] = [
  {
    id: 1,
    titleKhmer: 'ក្បួនទី ១: ខែលត្រីកោណបាតវាំង (Triangle Palace Shield)',
    titleEn: 'Level 1: The Triangle Palace Shield',
    desc: 'Vua (h1) đang đối mặt với các đòn thọc thẳng. Dùng quân Lính tại h5 trượt xuống h2 bịt kín trục dọc để che chắn an toàn tuyệt đối cho Vua.',
    difficulty: 'Beginner',
    hint: 'Trượt Lính từ h5 xuống h2 để hoàn thiện lá chắn tam giác!',
    solution: { fromCoord: 'h5', toCoord: 'h2' },
    setup: (board: Cell[]) => {
      board.fill(null)
      board[idx(7, 7)] = { player: 'you', king: true, id: makePieceId() } // h1
      board[idx(7, 6)] = { player: 'you', king: false, id: makePieceId() } // g1
      board[idx(6, 6)] = { player: 'you', king: false, id: makePieceId() } // g2
      board[idx(3, 7)] = { player: 'you', king: false, id: makePieceId() } // h5
      board[idx(7, 2)] = { player: 'opp', king: false, id: makePieceId() } // c1
      board[idx(1, 7)] = { player: 'opp', king: false, id: makePieceId() } // h7
      board[idx(0, 3)] = { player: 'opp', king: true, id: makePieceId() } // d8
    },
  },
  {
    id: 2,
    titleKhmer: 'ក្បួនទី ២: សសរភ្លោះការពារចំហៀង (Dual Column Guard)',
    titleEn: 'Level 2: The Dual Column Bastion',
    desc: 'Thiết lập bức tường cột đôi vững chắc để chặn đòn thọc sườn hiểm hóc của đối phương.',
    difficulty: 'Beginner',
    hint: 'Trượt quân từ b4 sang f4 chặn ngay trước mũi tiến công của quân Đen.',
    solution: { fromCoord: 'b4', toCoord: 'f4' },
    setup: (board: Cell[]) => {
      board.fill(null)
      board[idx(7, 3)] = { player: 'you', king: true, id: makePieceId() } // d1
      board[idx(6, 3)] = { player: 'you', king: false, id: makePieceId() } // d2
      board[idx(6, 2)] = { player: 'you', king: false, id: makePieceId() } // c2
      board[idx(4, 1)] = { player: 'you', king: false, id: makePieceId() } // b4
      board[idx(3, 5)] = { player: 'opp', king: false, id: makePieceId() } // f5
      board[idx(5, 5)] = { player: 'opp', king: false, id: makePieceId() } // f3
      board[idx(0, 3)] = { player: 'opp', king: true, id: makePieceId() } // d8
    },
  },
  {
    id: 3,
    titleKhmer: 'ក្បួនទី ៣: បង្ក្រាបកណ្តាលបំបែកទ័ព (Central Flank Strike)',
    titleEn: 'Level 3: The Central Rek Split',
    desc: 'Hai quân Lính địch đứng thẳng hàng tại b4 và d4. Trượt quân vào ô c4 để thi triển đòn Gánh (Rek) chia tách đội hình đối phương.',
    difficulty: 'Intermediate',
    hint: 'Trượt Lính từ c1 lên c4 để gánh cùng lúc cả b4 và d4!',
    solution: { fromCoord: 'c1', toCoord: 'c4' },
    setup: (board: Cell[]) => {
      board.fill(null)
      board[idx(7, 3)] = { player: 'you', king: true, id: makePieceId() } // d1
      board[idx(7, 2)] = { player: 'you', king: false, id: makePieceId() } // c1
      board[idx(4, 1)] = { player: 'opp', king: false, id: makePieceId() } // b4
      board[idx(4, 3)] = { player: 'opp', king: false, id: makePieceId() } // d4
      board[idx(0, 3)] = { player: 'opp', king: true, id: makePieceId() } // d8
    },
  },
  {
    id: 4,
    titleKhmer: 'ក្បួនទី ៤: រែកចាប់ស្ដេច (Direct King Assassination)',
    titleEn: 'Level 4: The Royal King Ambush',
    desc: 'Vua Đen ở d3 và Lính Đen ở d5 đứng kề hai phía của ô d4. Trượt quân vào d4 để Gánh bắt Vua ngay lập tức.',
    difficulty: 'Intermediate',
    hint: 'Trượt quân từ a4 sang d4; hai nạn nhân phải nằm kề sát ở d3 và d5.',
    solution: { fromCoord: 'a4', toCoord: 'd4' },
    setup: (board: Cell[]) => {
      board.fill(null)
      board[idx(7, 0)] = { player: 'you', king: true, id: makePieceId() } // a1
      board[idx(4, 0)] = { player: 'you', king: false, id: makePieceId() } // a4
      board[idx(5, 3)] = { player: 'opp', king: true, id: makePieceId() } // d3
      board[idx(3, 3)] = { player: 'opp', king: false, id: makePieceId() } // d5
    },
  },
  {
    id: 5,
    titleKhmer: 'ក្បួនទី ៥: សំណាញ់ព័ទ្ធជ្រុង (Corner Poat Encirclement)',
    titleEn: 'Level 5: The Corner Poat Net',
    desc: 'Quân Đen ở góc a8 đã bị vây 1 phía bởi b8. Hãy trượt quân lên a7 để bịt kín ô khí cuối cùng, ăn gọn quân địch bằng đòn Bao Vây (Poat)!',
    difficulty: 'Intermediate',
    hint: 'Trượt quân từ a5 lên a7 để tước toàn bộ khí (0 liberties) của quân góc a8!',
    solution: { fromCoord: 'a5', toCoord: 'a7' },
    setup: (board: Cell[]) => {
      board.fill(null)
      board[idx(7, 3)] = { player: 'you', king: true, id: makePieceId() } // d1
      board[idx(3, 0)] = { player: 'you', king: false, id: makePieceId() } // a5
      board[idx(0, 1)] = { player: 'you', king: false, id: makePieceId() } // b8
      board[idx(0, 0)] = { player: 'opp', king: false, id: makePieceId() } // a8
      board[idx(0, 4)] = { player: 'opp', king: true, id: makePieceId() } // e8
    },
  },
  {
    id: 6,
    titleKhmer: 'ក្បួនទី ៦: ព័ទ្ធកម្ទេចកងវរជន (Phalanx Mass Encirclement)',
    titleEn: 'Level 6: Phalanx Mass Encirclement',
    desc: 'Cụm liên kết 3 quân Đen (a7, a8, b8) đang bị bao vây chặt bởi a6 và c8. Trượt quân vào b7 để triệt tiêu toàn bộ đường thoát của cả cụm 3 quân!',
    difficulty: 'Master',
    hint: 'Di chuyển quân từ e7 sang b7 để đóng chiếc lồng sắt vây bắt cả 3 quân Đen!',
    solution: { fromCoord: 'e7', toCoord: 'b7' },
    setup: (board: Cell[]) => {
      board.fill(null)
      board[idx(7, 3)] = { player: 'you', king: true, id: makePieceId() } // d1
      board[idx(1, 4)] = { player: 'you', king: false, id: makePieceId() } // e7
      board[idx(2, 0)] = { player: 'you', king: false, id: makePieceId() } // a6
      board[idx(0, 2)] = { player: 'you', king: false, id: makePieceId() } // c8
      board[idx(0, 0)] = { player: 'opp', king: false, id: makePieceId() } // a8
      board[idx(1, 0)] = { player: 'opp', king: false, id: makePieceId() } // a7
      board[idx(0, 1)] = { player: 'opp', king: false, id: makePieceId() } // b8
      board[idx(0, 7)] = { player: 'opp', king: true, id: makePieceId() } // h8
    },
  },
  {
    id: 7,
    titleKhmer: 'ក្បួនទី ៧: រែកហើយព័ទ្ធចាប់ស្ដេច (Rek-Poat Cascade)',
    titleEn: 'Level 7: The Rek-Poat Royal Cascade',
    desc: 'Một nước hợp lệ tạo đồng thời hai tầng chiến thuật: trượt c1→c4 để Gánh b4/d4, rồi quân vừa đáp c4 khóa khí cuối cùng của Vua Đen ở c5 để Poat kết thúc ván.',
    difficulty: 'Master',
    hint: 'Đi c1 → c4. Engine phải xử Rek trước, sau đó mới quét Poat trên bàn cờ hậu-Rek.',
    solution: { fromCoord: 'c1', toCoord: 'c4' },
    setup: (board: Cell[]) => {
      board.fill(null)
      board[idx(7, 3)] = { player: 'you', king: true, id: makePieceId() } // d1
      board[idx(7, 2)] = { player: 'you', king: false, id: makePieceId() } // c1 mover

      // Horizontal Rek victims around c4.
      board[idx(4, 1)] = { player: 'opp', king: false, id: makePieceId() } // b4
      board[idx(4, 3)] = { player: 'opp', king: false, id: makePieceId() } // d4

      // Opponent King at c5 has c4 as its final liberty before the move.
      board[idx(3, 2)] = { player: 'opp', king: true, id: makePieceId() } // c5
      board[idx(3, 1)] = { player: 'you', king: false, id: makePieceId() } // b5
      board[idx(3, 3)] = { player: 'you', king: false, id: makePieceId() } // d5
      board[idx(2, 2)] = { player: 'you', king: false, id: makePieceId() } // c6
    },
  },
]
