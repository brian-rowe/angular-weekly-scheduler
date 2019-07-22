export const enum OverlapState {
    NoOverlap,
    CurrentIsInsideOther,
    CurrentCoversOther,
    OtherEndIsInsideCurrent,
    OtherStartIsInsideCurrent,

    OtherEndIsCurrentStart,
    OtherStartIsCurrentEnd
}