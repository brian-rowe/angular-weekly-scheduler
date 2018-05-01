const enum OverlapState {
    NoOverlap,
    CurrentIsInsideOther,
    CurrentCoversOther,
    OtherEndIsInsideCurrent,
    OtherStartIsInsideCurrent
}