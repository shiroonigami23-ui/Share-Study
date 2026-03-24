// text_score.S
// AArch64 ABI
// int text_score(const char* s)
// Score: +2 for uppercase letters, +1 for lowercase letters, +1 for digits.

    .text
    .global text_score

text_score:
    mov x1, #0              // score
    cbz x0, done

loop:
    ldrb w2, [x0], #1
    cbz w2, done

    // uppercase A-Z
    cmp w2, #'A'
    blt check_lower
    cmp w2, #'Z'
    bgt check_lower
    add x1, x1, #2
    b loop

check_lower:
    cmp w2, #'a'
    blt check_digit
    cmp w2, #'z'
    bgt check_digit
    add x1, x1, #1
    b loop

check_digit:
    cmp w2, #'0'
    blt loop
    cmp w2, #'9'
    bgt loop
    add x1, x1, #1
    b loop

done:
    mov x0, x1
    ret
