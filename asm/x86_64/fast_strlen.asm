; fast_strlen.asm
; SysV x86_64 ABI
; size_t fast_strlen(const char* s)

global fast_strlen
section .text

fast_strlen:
    xor rax, rax            ; length counter
    test rdi, rdi
    jz .done

.loop:
    mov dl, [rdi + rax]
    test dl, dl
    jz .done
    inc rax
    jmp .loop

.done:
    ret
