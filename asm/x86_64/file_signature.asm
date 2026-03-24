; file_signature.asm
; SysV x86_64 ABI
; int starts_with_sig(const unsigned char* buf, size_t len, const unsigned char* sig, size_t sig_len)
; Returns 1 if buf starts with sig, else 0.

global starts_with_sig
section .text

starts_with_sig:
    ; rdi = buf, rsi = len, rdx = sig, rcx = sig_len
    cmp rsi, rcx
    jb .no
    xor r8, r8

.compare:
    cmp r8, rcx
    je .yes
    mov al, [rdi + r8]
    mov bl, [rdx + r8]
    cmp al, bl
    jne .no
    inc r8
    jmp .compare

.yes:
    mov eax, 1
    ret

.no:
    xor eax, eax
    ret
