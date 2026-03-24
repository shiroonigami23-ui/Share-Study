; auth_token_score.asm
; int auth_token_score(const char* s)
; +2 uppercase, +1 lowercase, +1 digits, +3 special chars

global auth_token_score
section .text

auth_token_score:
    xor eax, eax
    test rdi, rdi
    jz .done

.loop:
    mov bl, [rdi]
    test bl, bl
    jz .done

    cmp bl, 'A'
    jb .check_lower
    cmp bl, 'Z'
    jg .check_lower
    add eax, 2
    jmp .next

.check_lower:
    cmp bl, 'a'
    jb .check_digit
    cmp bl, 'z'
    jg .check_digit
    add eax, 1
    jmp .next

.check_digit:
    cmp bl, '0'
    jb .check_special
    cmp bl, '9'
    jg .check_special
    add eax, 1
    jmp .next

.check_special:
    add eax, 3

.next:
    inc rdi
    jmp .loop

.done:
    ret
