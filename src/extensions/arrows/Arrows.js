/**
 * Authors and copyright: Barak Michener (@barakmich) and Stefan Haack (@shaack)
 * Repository: https://github.com/shaack/cm-chessboard
 * License: MIT, see file 'LICENSE'
 */

import {Extension, EXTENSION_POINT} from "../../model/Extension.js"
import {Svg} from "../../lib/Svg.js"

export const ARROW_TYPE = {
    default: {class: "arrow-default", slice: "arrowDefault", headSize: 7},
    danger: {class: "arrow-danger", slice: "arrowDefault", headSize: 7},
    pointy: {class: "arrow-pointy", slice: "arrowPointy", headSize: 7},
}

export class Arrows extends Extension {

    /** @constructor */
    constructor(chessboard, props = {}) {
        super(chessboard)
        this.registerExtensionPoint(EXTENSION_POINT.redrawBoard, () => {
            this.onRedrawBoard()
        })
        this.props = {
            sprite: "arrows.svg"
        }
        Object.assign(this.props, props)
        if (this.chessboard.props.assetsCache) {
            // SMK: Absolute path to arrows.
            this.chessboard.view.cacheSpriteToDiv("cm-chessboard-arrows", this.getSpriteUrl())
            /*    
            this.chessboard.view.cacheSpriteToDiv("cm-chessboard-arrows",
                this.chessboard.props.assetsUrl + "extensions/arrows/" + this.props.sprite)
            */
        }
        chessboard.addArrow = this.addArrow.bind(this)
        chessboard.getArrows = this.getArrows.bind(this)
        chessboard.removeArrows = this.removeArrows.bind(this)
        this.arrowGroup = Svg.addElement(chessboard.view.markersTopLayer, "g", {class: "arrows"})
        this.arrows = []
    }

    onRedrawBoard() {
        while (this.arrowGroup.firstChild) {
            this.arrowGroup.removeChild(this.arrowGroup.firstChild)
        }
        this.arrows.forEach((arrow) => {
            this.drawArrow(arrow)
        })
    }

    drawArrow(arrow) {
        const arrowsGroup = Svg.addElement(this.arrowGroup, "g")
        arrowsGroup.setAttribute("data-arrow", arrow.from + arrow.to)
        arrowsGroup.setAttribute("class", "arrow " + arrow.type.class)
        const view = this.chessboard.view
        const sqfrom = document.querySelectorAll('[data-square="' + arrow.from + '"]')[0]
        const sqto = document.querySelectorAll('[data-square="' + arrow.to + '"]')[0]
        // SMK: Absolute path to arrows.
        const spriteUrl = this.chessboard.props.assetsCache ? "" : this.getSpriteUrl()
        /*const spriteUrl = this.chessboard.props.assetsCache ? "" : this.chessboard.props.assetsUrl +
            "extensions/arrows/" + this.props.sprite
        */
        const defs = Svg.addElement(arrowsGroup, "defs")
        const id = "arrow-" + arrow.from + arrow.to
        const marker = Svg.addElement(defs, "marker", {
            id: id,
            markerWidth: arrow.type.headSize,
            markerHeight: arrow.type.headSize,
            //markerUnits: "userSpaceOnUse",
            refX: 20,
            refY: 20,
            viewBox: "0 0 40 40",
            orient: "auto",
            class: "arrow-head",
        })

        const ignored = Svg.addElement(marker, "use", {
            href: `${spriteUrl}#${arrow.type.slice}`,
        })


        const x1 = sqfrom.x.baseVal.value + (sqfrom.width.baseVal.value / 2)
        const x2 = sqto.x.baseVal.value + (sqto.width.baseVal.value / 2)
        const y1 = sqfrom.y.baseVal.value + (sqfrom.height.baseVal.value / 2)
        const y2 = sqto.y.baseVal.value + (sqto.height.baseVal.value / 2)

        const width = ((view.scalingX + view.scalingY) / 2) * 4
        let lineFill = Svg.addElement(arrowsGroup, "line")
        lineFill.setAttribute('x1', x1)
        lineFill.setAttribute('x2', x2)
        lineFill.setAttribute('y1', y1)
        lineFill.setAttribute('y2', y2)
        lineFill.setAttribute('class', 'arrow-line')
        lineFill.setAttribute("marker-end", "url(#" + id + ")")
        lineFill.setAttribute('stroke-width', width + "px")

    }

    addArrow(type, from, to) {
        this.arrows.push(new Arrow(from, to, type))
        this.chessboard.view.redrawBoard()
    }

    getArrows(type = undefined, from = undefined, to = undefined) {
        let arrows = []
        this.arrows.forEach((arrow) => {
            if (arrow.matches(from, to, type)) {
                arrows.push(arrow)
            }
        })
        return arrows
    }

    removeArrows(type = undefined, from = undefined, to = undefined) {
        this.arrows = this.arrows.filter((arrow) => !arrow.matches(from, to, type))
        this.chessboard.view.redrawBoard()
    }

    getSpriteUrl() {
        // SMK: Absolute path to arrows.
        return this.props.sprite
    }
}

class Arrow {
    constructor(from, to, type) {
        this.from = from
        this.to = to
        this.type = type
    }

    matches(from = undefined, to = undefined, type = undefined) {
        if (from && from !== this.from) {
            return false
        }
        if (to && to !== this.to) {
            return false
        }
        return !(type && type !== this.type)
    }
}
