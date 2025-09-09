        NUM1    EQU H'20'
        NUM2    EQU H'21'
        NUM3    EQU H'22'
        RESULT  EQU H'23'

START:
        CLRF
        MOVLW  30
        MOVWF  NUM1
        MOVLW  5
        MOVWF  NUM2
        MOVLW  0
        MOVWF  RESULT


DIV:
        MOVF    NUM2
        SUBWF   NUM1, 1
        MOVWF   NUM3
        INCF    RESULT, 1
        BTFSC   NUM3, 0
        GOTO    DIV
