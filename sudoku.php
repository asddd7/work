<?php

// ==========================
// SUDOKU TERMINAL GAME (CLI)
// ==========================

// Board awal (0 = kosong)
$board = [
    [5,3,0, 0,7,0, 0,0,0],
    [6,0,0, 1,9,5, 0,0,0],
    [0,9,8, 0,0,0, 0,6,0],

    [8,0,0, 0,6,0, 0,0,3],
    [4,0,0, 8,0,3, 0,0,1],
    [7,0,0, 0,2,0, 0,0,6],

    [0,6,0, 0,0,0, 2,8,0],
    [0,0,0, 4,1,9, 0,0,5],
    [0,0,0, 0,8,0, 0,7,9],
];

// ==========================
// FUNCTION PRINT BOARD
// ==========================
function printBoard($board) {
    echo "\n   1 2 3   4 5 6   7 8 9\n";
    echo "  -----------------------\n";
    for ($row = 0; $row < 9; $row++) {
        echo ($row+1) . " |";
        for ($col = 0; $col < 9; $col++) {
            $value = $board[$row][$col] == 0 ? "." : $board[$row][$col];
            echo " $value";
            if (($col + 1) % 3 == 0) echo " |";
        }
        echo "\n";
        if (($row + 1) % 3 == 0)
            echo "  -----------------------\n";
    }
}

// ==========================
// VALIDASI MOVE
// ==========================
function isValidMove($board, $row, $col, $num) {

    // Cek baris
    for ($c = 0; $c < 9; $c++) {
        if ($board[$row][$c] == $num) return false;
    }

    // Cek kolom
    for ($r = 0; $r < 9; $r++) {
        if ($board[$r][$col] == $num) return false;
    }

    // Cek kotak 3x3
    $startRow = floor($row / 3) * 3;
    $startCol = floor($col / 3) * 3;

    for ($r = $startRow; $r < $startRow + 3; $r++) {
        for ($c = $startCol; $c < $startCol + 3; $c++) {
            if ($board[$r][$c] == $num) return false;
        }
    }

    return true;
}

// ==========================
// CEK MENANG
// ==========================
function isBoardFull($board) {
    for ($r = 0; $r < 9; $r++) {
        for ($c = 0; $c < 9; $c++) {
            if ($board[$r][$c] == 0) return false;
        }
    }
    return true;
}

// ==========================
// GAME LOOP
// ==========================

echo "=== SUDOKU TERMINAL GAME ===\n";
echo "Cara main:\n";
echo "Ketik: baris kolom angka\n";
echo "Contoh: 1 3 4\n";
echo "Ketik 'exit' untuk keluar\n";

while (true) {

    printBoard($board);

    if (isBoardFull($board)) {
        echo "🎉 Selamat! Kamu menyelesaikan Sudoku!\n";
        break;
    }

    echo "\nInput: ";
    $input = trim(fgets(STDIN));

    if ($input === "exit") {
        echo "Game dihentikan.\n";
        break;
    }

    $parts = explode(" ", $input);

    if (count($parts) != 3) {
        echo "Format salah!\n";
        continue;
    }

    $row = intval($parts[0]) - 1;
    $col = intval($parts[1]) - 1;
    $num = intval($parts[2]);

    if ($row < 0 || $row > 8 || $col < 0 || $col > 8 || $num < 1 || $num > 9) {
        echo "Input tidak valid!\n";
        continue;
    }

    if ($board[$row][$col] != 0) {
        echo "Kotak sudah terisi!\n";
        continue;
    }

    if (isValidMove($board, $row, $col, $num)) {
        $board[$row][$col] = $num;
        echo "✔ Berhasil!\n";
    } else {
        echo "❌ Tidak valid menurut aturan Sudoku!\n";
    }
}