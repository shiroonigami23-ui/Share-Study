# Assembly Toolkit (StudyShare)

This folder enriches the project with low-level assembly learning modules.

## Layout

- `x86_64/fast_strlen.asm` - SIMD-friendly string length routine (SysV ABI).
- `x86_64/file_signature.asm` - tiny byte-signature scanner for file headers.
- `aarch64/text_score.S` - ARM64 routine for quick text scoring.
- `build.sh` - sample build commands.

## Why this exists

StudyShare is primarily web/backend, but this toolkit adds a systems-level track
for students learning:
- calling conventions
- register discipline
- function prologue/epilogue design
- cross-architecture differences

## Build (Linux/macOS examples)

```bash
cd asm
chmod +x build.sh
./build.sh
```
