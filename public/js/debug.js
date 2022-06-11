function initDebug() {



    var head = document.getElementById('infoDataWrapper').querySelector('.header');
    var m = document.getElementById('infoDataWrapper')
    var offset;
    head.addEventListener("mousedown", mouseDown, false);
    window.addEventListener("mouseup", mouseUp, false);

    function mouseUp() {
        window.removeEventListener("mousemove", move, true);
    }

    function mouseDown(e) {
        // SAVE THE OFFSET HERE
        offset = {
            left: e.pageX - realOffset(head).left,
            top: e.pageY - realOffset(head).top
        };
        window.addEventListener("mousemove", move, true);
    }

    function move(e) {
        // REUSE THE OFFSET HERE
        m.style.left = (e.pageX - offset.left) + "px";
        m.style.top = (e.pageY - offset.top) + "px";
    }

    /*
     * Returns the given element's offset relative to the document.
     */
    function realOffset(elem) {
        var top = 0,
            left = 0;
        while (elem) {
            top = top + parseInt(elem.offsetTop, 10);
            left = left + parseInt(elem.offsetLeft, 10);
            elem = elem.offsetParent;
        }
        return {
            top: top,
            left: left
        };
    }

    function _(element) {
        return document.getElementById(element);
    }
}