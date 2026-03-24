#!/usr/bin/env bash
set -euo pipefail

mkdir -p build

if command -v nasm >/dev/null 2>&1; then
  nasm -f elf64 x86_64/fast_strlen.asm -o build/fast_strlen.o
  nasm -f elf64 x86_64/file_signature.asm -o build/file_signature.o
  echo "Built x86_64 NASM objects in asm/build/"
else
  echo "nasm not found; skipping x86_64 assembly build"
fi

if command -v clang >/dev/null 2>&1; then
  # Only compiles on AArch64 host/toolchain.
  echo "For AArch64: clang -c aarch64/text_score.S -o build/text_score.o"
else
  echo "clang not found; skipping AArch64 assembly hint"
fi
