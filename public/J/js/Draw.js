var ITEM_TYPE = {
    ZOOM : "zoom",
    SELECT : "select",
    ERASER : "eraser",
    LINE_FREE_PEN : "line_free_pen",
    LINE_FREE_MARKER : "line_free_marker",
    LINE_STRAIGHT : "line_straight",
    RECT_FILL : "rect_fill",
    RECT_EMPTY : "rect_empty",
    RECT_SELECT : "rect_select",
    TEXT : "text",
    IMAGE : "image",
};

var angle_rotation = 0;
var scale_zoom = 1.0;
var background_width = $("#draw").width();
var background_height = $("#draw").height();
var is_freeze = false;
var is_freeze_draw = false;
var item_mask = null;
var is_mask = false;
var is_draw_start_over_mask = false;
var item_highlight = null;
var is_highlight = false;
var is_draw_start_over_highlight = false;
var is_compare = false;
var defaultX = 0;
var defaultY = 0;
var rangeX = 0;
var rangeY = 0;

/* ------------------------------------------------------------------------------------------------ */
var item_type = ITEM_TYPE.LINE_FREE_PEN;
var item = null;
var isDown, origX, origY;
var canvas = new fabric.Canvas('canvas', {
    hoverCursor: 'pointer',
    targetFindTolerance: 15,
    selection: false,
    preserveObjectStacking: true,
});
canvas.setWidth($("#draw").width());
canvas.setHeight($("#draw").height());
canvas.zoomToPoint(new fabric.Point(($("#draw").width()) / 2, ($("#draw").height()) / 2), 1.0);
canvas.freeDrawingBrush.color = "rgba(0,0,0,1.0)";
canvas.freeDrawingBrush.width = 3;
canvas.backgroundColor = "rgba(0,0,0,0)";
canvas.renderAll();

/* ------------------------------------------------------------------------------------------------ */
fabric.Object.prototype.set({
    transparentCorners: false,
    cornerColor: 'rgba(255,0,0,0.8)',
    borderColor: '#000000',
    cornerSize: 20,
    padding: 5
});
var touchstart_bar = 0;
var touchmove_bar = 0;

/* ------------------------------------------------------------------------------------------------ */
var item_highlight_bg_t = new fabric.Rect({  left: 0, top: 0, originX: 'left', originY: 'top', width: canvas.width, height: canvas.height, angle: 0, strokeWidth : 0, selectable: false });
var item_highlight_bg_b = new fabric.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: canvas.width, height: canvas.height, angle: 0, strokeWidth : 0, selectable: false });
var item_highlight_bg_l = new fabric.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: canvas.width, height: canvas.height, angle: 0, strokeWidth : 0, selectable: false });
var item_highlight_bg_r = new fabric.Rect({ left: 0, top: 0, originX: 'left', originY: 'top', width: canvas.width, height: canvas.height, angle: 0, strokeWidth : 0, selectable: false });

/* ------------------------------------------------------------------------------------------------ */
var timer_set = "";
var item_timer = new fabric.Text("00:00.00", {
    fontSize: $("#draw").width()/2.5, fontFamily: "Arial", fontWeight: "",
    fill: "white", backgroundColor: "rgba(0, 0, 0, 0.8)",
});
item_timer.lockRotation = true;
item_timer.hasRotatingPoint = false;

/* ------------------------------------------------------------------------------------------------ */
var objs_camera = [], objs_wb1 = [], objs_wb2 = [], objs_wb3 = [], objs_wb4 = [], objs_transparent = [], objs_image = [], objs_video = [], objs_material = [];
function clearObjectsCanvas(type) {
    if (type == "camera") {
        objs_camera = [];
    } else if (type == "whiteboard1") {
        objs_wb1 = [];
    } else if (type == "whiteboard2") {
        objs_wb2 = [];
    } else if (type == "whiteboard3") {
        objs_wb3 = [];
    } else if (type == "whiteboard4") {
        objs_wb4 = [];
    } else if (type == "transparent") {
        objs_transparent = [];
    } else if (type == "image") {
        objs_image = [];
    } else if (type == "video") {
        objs_video = [];
    } else if (type == "material") {
        objs_material = [];
    }
}
function saveObjectsCanvas(type) {
    for (var i = 0; i < canvas._objects.length; i++) {
        if (type == "camera") {
            objs_camera.push(canvas._objects[i]);
        } else if (type == "whiteboard1") {
            objs_wb1.push(canvas._objects[i]);
        } else if (type == "whiteboard2") {
            objs_wb2.push(canvas._objects[i]);
        } else if (type == "whiteboard3") {
            objs_wb3.push(canvas._objects[i]);
        } else if (type == "whiteboard4") {
            objs_wb4.push(canvas._objects[i]);
        } else if (type == "transparent") {
            objs_transparent.push(canvas._objects[i]);
        } else if (type == "image") {
            objs_image.push(canvas._objects[i]);
        } else if (type == "video") {
            objs_video.push(canvas._objects[i]);
        } else if (type == "material") {
            objs_material.push(canvas._objects[i]);
        }
    }
}
function loadObjectsCanvas(type) {
    if (type == "camera") {
        for (var i = 0; i < objs_camera.length; i++) canvas.add(objs_camera[i]);
    } else if (type == "whiteboard1") {
        for (var i = 0; i < objs_wb1.length; i++) canvas.add(objs_wb1[i]);
    } else if (type == "whiteboard2") {
        for (var i = 0; i < objs_wb2.length; i++) canvas.add(objs_wb2[i]);
    } else if (type == "whiteboard3") {
        for (var i = 0; i < objs_wb3.length; i++) canvas.add(objs_wb3[i]);
    } else if (type == "whiteboard4") {
        for (var i = 0; i < objs_wb4.length; i++) canvas.add(objs_wb4[i]);
    } else if (type == "transparent") {
        for (var i = 0; i < objs_transparent.length; i++) canvas.add(objs_transparent[i]);
    } else if (type == "image") {
        for (var i = 0; i < objs_image.length; i++) canvas.add(objs_image[i]);
    } else if (type == "video") {
        for (var i = 0; i < objs_video.length; i++) canvas.add(objs_video[i]);
    } else if (type == "material") {
        for (var i = 0; i < objs_material.length; i++) canvas.add(objs_material[i]);
    }
    canvas.renderAll();
}

/* ------------------------------------------------------------------------------------------------ */
var isRedoing = false;
var isUndoing = false;
var listRedo = [];
var listUndo = [];
canvas.on('object:added',function() {
    if(!isRedoing) {
        listRedo = [];
    }
    if(!isUndoing) {
        listUndo = [];
    }
    isRedoing = false;
    isUndoing = false;
});
function undo() {
    if (listUndo.length > 0) {
        isUndoing = true;
        canvas.add(listUndo.pop());
        canvas.renderAll();
    } else if (canvas._objects.length > 0) {
        listRedo.push(canvas._objects.pop());
        canvas.renderAll();
    }
}
function redo() {
    if(listRedo.length > 0) {
        isRedoing = true;
        canvas.add(listRedo.pop());
        canvas.renderAll();
    }
}

/* ------------------------------------------------------------------------------------------------ */
function setBackgroung(path, angle) {
    canvas.backgroundColor = "rgba(0, 0, 0, 1.0)";
    fabric.Image.fromURL(path, function(img) {
        var canvasAspect = canvas.width / canvas.height;
        var imgAspect = img.width / img.height;
        var left, top, scaleFactor;
        if (canvasAspect <= imgAspect) {
            scaleFactor = canvas.width / img.width;
            left = 0;
            top = -((img.height * scaleFactor) - canvas.height) / 2;
        } else {
            scaleFactor = canvas.height / img.height;
            top = 0;
            left = -((img.width * scaleFactor) - canvas.width) / 2;
        }
        var ang = 180;
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), { top: top, left: left, originX: angle == 0 ? 'left' : 'right', originY: angle == 0 ? 'top' : 'bottom', scaleX: scaleFactor, scaleY: scaleFactor, angle: angle, });
        canvas.renderAll();
    });
}

/* ------------------------------------------------------------------------------------------------ */
function setItemType(m) {
    if (m == ITEM_TYPE.ZOOM) {
        canvas.isDrawingMode = true;
        if (!useBrowser.includes("safari")) canvas.freeDrawingCursor = 'pointer';
        canvas.selection = false;
        if (canvas.freeDrawingBrush.color.slice(-4) != "0.0)") canvas.freeDrawingBrush.color = canvas.freeDrawingBrush.color.slice(0,-4) + "0.0)";
        item_type = ITEM_TYPE.ZOOM;
    }else if (m == ITEM_TYPE.SELECT) {
        canvas.isDrawingMode = false;
        if (!useBrowser.includes("safari")) canvas.defaultCursor = 'pointer';
        canvas.selection = true;
        item_type = ITEM_TYPE.SELECT;
    } else if (m == ITEM_TYPE.ERASER) {
        canvas.isDrawingMode = false;
        if (!useBrowser.includes("safari")) canvas.defaultCursor = 'url(./' + useLanguage + '/images/cursor_eraser.png) 0 30, auto';
        canvas.selection = false;
        item_type = ITEM_TYPE.ERASER;
        canvas.discardActiveObject();
    } else {
        canvas.isDrawingMode = true;
        canvas.selection = false;
        if (m == ITEM_TYPE.LINE_FREE_PEN) {
            item_type = ITEM_TYPE.LINE_FREE_PEN;
            if (canvas.freeDrawingBrush.color.slice(-4) == "0.0)") canvas.freeDrawingBrush.color = canvas.freeDrawingBrush.color.slice(0,-4) + "1.0)";
            if (!useBrowser.includes("safari")) canvas.freeDrawingCursor = 'url(./' + useLanguage + '/images/cursor_pencil.png) 0 30, auto';
        } else if (m == ITEM_TYPE.LINE_FREE_MARKER) {
            item_type = ITEM_TYPE.LINE_FREE_MARKER;
            if (canvas.freeDrawingBrush.color.slice(-4) == "0.0)") canvas.freeDrawingBrush.color = canvas.freeDrawingBrush.color.slice(0,-4) + opacity_marker.toFixed(1) + ")";
            if (!useBrowser.includes("safari")) canvas.freeDrawingCursor = 'url(./' + useLanguage + '/images/cursor_marker.png) 0 30, auto';
        } else {
            if (canvas.freeDrawingBrush.color.slice(-4) != "0.0)") canvas.freeDrawingBrush.color = canvas.freeDrawingBrush.color.slice(0,-4) + "0.0)";
            if (m == ITEM_TYPE.LINE_STRAIGHT) {
                item_type = ITEM_TYPE.LINE_STRAIGHT;
                if (!useBrowser.includes("safari")) canvas.freeDrawingCursor = 'url(./' + useLanguage + '/images/cursor_cross.png) 15 15, auto';
            } else if (m == ITEM_TYPE.RECT_FILL) {
                item_type = ITEM_TYPE.RECT_FILL;
                if (!useBrowser.includes("safari")) canvas.freeDrawingCursor = 'url(./' + useLanguage + '/images/cursor_cross.png) 15 15, auto';
            } else if (m == ITEM_TYPE.RECT_EMPTY) {
                item_type = ITEM_TYPE.RECT_EMPTY;
                if (!useBrowser.includes("safari")) canvas.freeDrawingCursor = 'url(./' + useLanguage + '/images/cursor_cross.png) 15 15, auto';
            } else if (m == ITEM_TYPE.RECT_SELECT) {
                item_type = ITEM_TYPE.RECT_SELECT;
                if (!useBrowser.includes("safari")) canvas.freeDrawingCursor = 'url(./' + useLanguage + '/images/cursor_cross.png) 15 15, auto';
            } else if (m == ITEM_TYPE.TEXT) {
                item_type = ITEM_TYPE.TEXT;
                if (!useBrowser.includes("safari")) canvas.freeDrawingCursor = 'url(./' + useLanguage + '/images/cursor_tag.png) 0 0, auto';
            } else if (m == ITEM_TYPE.IMAGE) {
                canvas.isDrawingMode = false;
                item_type = ITEM_TYPE.IMAGE;
                if (!useBrowser.includes("safari")) canvas.defaultCursor = 'pointer';
            }
        }
    }
    canvas.requestRenderAll();
}

/* ------------------------------------------------------------------------------------------------ */
function down(pointer) {
    if (item_type == ITEM_TYPE.ZOOM) {
        if (background_type == "camera" || background_type == "video") {
            defaultX = parseInt($('#video').css('margin-left').replace('px', ''));
            defaultY = parseInt($('#video').css('margin-top').replace('px', ''));
            rangeX = Math.ceil((background_width * scale_zoom - canvas.width) / 2);
            rangeY = Math.ceil((background_height * scale_zoom - canvas.height) / 2);
        } else {
/*
            defaultX = moveX_draw;
            defaultY = moveY_draw;
            rangeX = Math.ceil(($("#draw").width() * scale_zoom - $("#draw").width()) / 2);
            rangeY = Math.ceil(($("#draw").height() * scale_zoom - $("#draw").height()) / 2);
*/
            defaultX = parseInt($('#canvas').css('margin-left').replace('px', ''));
            defaultY = parseInt($('#canvas').css('margin-top').replace('px', ''));
            rangeX = Math.ceil((background_width * scale_zoom - canvas.width) / 2);
            rangeY = Math.ceil((background_height * scale_zoom - canvas.height) / 2);
        }
        return;
    }
/*
    if (document.getElementById('video').style.display == "block" && is_freeze == false) {
        freeze(); is_freeze_draw = true;
    }
*/
    edit_text = false;
    if (item_type == ITEM_TYPE.LINE_STRAIGHT) {
        item = new fabric.Line([origX, origY, origX, origY], { strokeWidth: width_pen, fill: color_marker.slice(0,-4) + opacity_marker.toFixed(1) + ")", stroke: color_marker.slice(0,-4) + opacity_marker.toFixed(1) + ")", originX: 'left', originY: 'top' });
        canvas.add(item);
        canvas.renderAll();
    } else if (item_type == ITEM_TYPE.RECT_FILL) {
        item = new fabric.Rect({ left: origX, top: origY, originX: 'left', originY: 'top', width: pointer.x-origX, height: pointer.y-origY, angle: 0, strokeWidth : width_pen, stroke: color_marker.slice(0,-4) + opacity_marker.toFixed(1) + ")", fill: color_marker.slice(0,-4) + opacity_marker.toFixed(1) + ")" });
        canvas.add(item);
        canvas.renderAll();
    } else if (item_type == ITEM_TYPE.RECT_EMPTY) {
        item = new fabric.Rect({ left: origX, top: origY, originX: 'left', originY: 'top', width: pointer.x-origX, height: pointer.y-origY, angle: 0, strokeWidth : width_pen, stroke: color_pen,fill: 'rgba(0,0,0,0.0)' });
        canvas.add(item);
        canvas.renderAll();
    } else if (item_type == ITEM_TYPE.RECT_SELECT) {
        item = new fabric.Rect({ left: origX, top: origY, originX: 'left', originY: 'top', width: pointer.x-origX, height: pointer.y-origY, angle: 0, strokeWidth : 10, stroke: 'rgba(0,0,0,1.0)', fill: 'rgba(0,0,0,0.0)', strokeDashArray: [12, 8] });
        canvas.add(item);
        canvas.renderAll();
    } else if (item_type == ITEM_TYPE.TEXT) {
        item = new fabric.IText("", { left: origX, top: origY, fontSize: font_size_text, fontFamily: font_family_text, fontWeight: font_weight_text, fill: color_text, backgroundColor: color_text_background });
        canvas.add(item).setActiveObject(item);
        item.width = 100;
        item.enterEditing();
        item.setCoords();
        item.hiddenTextarea.focus();
        canvas.renderAll();
        setItemType(ITEM_TYPE.SELECT)
    } else if (item_type == ITEM_TYPE.IMAGE) {
        fabric.Image.fromURL(imgInsertPath, function(img) {
            item = img.set({ left: origX, top: origY });
            item.scaleToWidth(100);
            item.scaleToHeight(100);
            canvas.add(item);
            canvas.renderAll();
        });
    }
}
var moveX = 0, moveY = 0;
var moveX_draw = 0, moveY_draw = 0;
function move(pointer, o) {
    if (item_type == ITEM_TYPE.ZOOM) {
        moveX = parseInt(-(origX - pointer.x), 10);
        moveY = parseInt(-(origY - pointer.y), 10);
        moveX = defaultX + moveX;
        moveY = defaultY + moveY;
        if (background_type == "camera" || background_type == "video") {
            if (-1 * rangeX <= moveX && rangeX >= moveX) {
                $('#video').css('margin-left', moveX + 'px');
                $('#canvas').css('margin-left', moveX + 'px');
            }
            if (-1 * rangeY <= moveY && rangeY >= moveY) {
                $('#video').css('margin-top', moveY + 'px');
                $('#canvas').css('margin-top', moveY + 'px');
            }
        } else {
/*
            var is_updateX = false, is_updateY = false;
            if (-1 * rangeX <= moveX && rangeX >= moveX) moveX_draw += o.e.movementX; is_updateX = true;
            if (-1 * rangeY <= moveY && rangeY >= moveY) moveY_draw += o.e.movementY; is_updateY = true;
            if (is_updateX == true && is_updateY == true) {
                canvas.relativePan(new fabric.Point(o.e.movementX, o.e.movementY));
            } else if (is_updateX == true && is_updateY == false) {
                canvas.relativePan(new fabric.Point(o.e.movementX, 0));
            } else if (is_updateX == false && is_updateY == true) {
                canvas.relativePan(new fabric.Point(0, o.e.movementY));
            }
*/
            if (-1 * rangeX <= moveX && rangeX >= moveX) {
                $('#canvas').css('margin-left', moveX + 'px');
            }
            if (-1 * rangeY <= moveY && rangeY >= moveY) {
                $('#canvas').css('margin-top', moveY + 'px');
            }
        }
    } else if (item_type == ITEM_TYPE.LINE_STRAIGHT) {
        item.set({ x2: pointer.x, y2: pointer.y });
        item.setCoords();
        canvas.renderAll();
    } else if (item_type == ITEM_TYPE.RECT_FILL || item_type == ITEM_TYPE.RECT_EMPTY || item_type == ITEM_TYPE.RECT_SELECT) {
        if(origX > pointer.x) item.set({ left: Math.abs(pointer.x) });
        if(origY > pointer.y) item.set({ top: Math.abs(pointer.y) });
        item.set({ width: Math.abs(origX - pointer.x) });
        item.set({ height: Math.abs(origY - pointer.y) });
        item.setCoords();
        canvas.renderAll();
    } else if (item_type == ITEM_TYPE.IMAGE) {
        if (origX > pointer.x) {
            item.set({ left: Math.abs(origX) - Math.abs(origX - pointer.x), flipX: true });
        } else {
            item.set({ left: Math.abs(origX), flipX: false });
        }
        if (origY > pointer.y) {
            item.set({ top: Math.abs(origY) - Math.abs(origY - pointer.y), flipY: true });
        } else {
            item.set({ top: Math.abs(origY), flipY: false });
        }
        item.scaleToWidth(Math.abs(origX - pointer.x));
        item.scaleToHeight(Math.abs(origY - pointer.y));
        item.setCoords();
        canvas.renderAll();
    }
}
function up(pointer) {
    if (is_mask == true && canvas.isDrawingMode == true) {
        canvas._objects[canvas._objects.length - 1].selectable = false;
        canvas.renderAll();
        if (is_draw_start_over_mask == false) canvas.sendToBack(canvas._objects[canvas._objects.length - 1]);
        is_draw_start_over_mask = false;
    }
    if (is_highlight == true && canvas.isDrawingMode == true) {
        canvas._objects[canvas._objects.length - 1].selectable = false;
        canvas.renderAll();
        if (is_draw_start_over_highlight == true) canvas.sendToBack(canvas._objects[canvas._objects.length - 1]);
        is_draw_start_over_highlight = false;
    }
    if (item_type == ITEM_TYPE.ZOOM) {
/*
        if (document.getElementById('video').style.display != "none") document.getElementById('video').play();
*/
        return;
    }
/*
    if (is_freeze_draw == true) freeze(); is_freeze_draw = false;
*/
    if (item_type == ITEM_TYPE.RECT_SELECT) {
        canvas.remove(item);
        canvas.renderAll();
        var finX = Math.abs(pointer.x);
        var finY = Math.abs(pointer.y);
        var x = origX < finX ? origX : finX;
        var y = origY < finY ? origY : finY;
        download_image(x, y, Math.abs(origX - finX), Math.abs(origY - finY));
        setItemType(ITEM_TYPE.LINE_FREE_PEN);
    }
    if (item_type == ITEM_TYPE.IMAGE) setItemType(ITEM_TYPE.LINE_FREE_PEN);
}

/* ------------------------------------------------------------------------------------------------ */
var index_switch_1 = -1, index_switch_2 = -1;
var compare_item_scale_x = -1, compare_item_scale_y = -1;
canvas.on('object:moving', function(o) {
    if (list_item_compare.includes(o.target)) {
        if (compare_item_scale_x == -1 && compare_item_scale_y == -1) {
            o.target.opacity = 0.5;
            compare_item_scale_x = o.target.scaleX * 0.5;
            compare_item_scale_y = o.target.scaleY * 0.5;
            o.target.set({ scaleX: compare_item_scale_x, scaleY: compare_item_scale_y });
            canvas.bringToFront(o.target);
        }
        var rect = o.e.target.getBoundingClientRect();
        var pointer = canvas.getPointer(o.e);
        if (o.e.clientX !== undefined) {
            pointer.x = o.e.clientX - rect.left;
            pointer.y = o.e.clientY - rect.top;
        } else {
            pointer.x = o.e.touches[0].clientX - rect.left;
            pointer.y = o.e.touches[0].clientY - rect.top;
        }
        o.target.set({ originX: 'center', originY: 'center', left: pointer.x, top: pointer.y });
        index_switch_1 = index_switch_2 = -1;
        o.target.setCoords();
        canvas.forEachObject(function(obj) {
            if (obj === o.target) return;
            if (o.target.isContainedWithinObject(obj) && list_item_compare.includes(obj)) {
                index_switch_1 = list_item_compare.indexOf(obj);
                index_switch_2 = list_item_compare.indexOf(o.target);
            }
        });
    }
});
canvas.on('object:modified', function(o) {
    if (list_item_compare.includes(o.target)) {
        o.target.opacity = 1.0;
        compare_item_scale_x = -1;
        compare_item_scale_y = -1;
        if (index_switch_1 != -1 && index_switch_2 != -1) {
            var img = list_image_compare[index_switch_1];
            list_image_compare.splice(index_switch_1, 1, list_image_compare[index_switch_2]);
            list_image_compare.splice(index_switch_2, 1, img);
            var is_check_1 = list_item_compare[index_switch_1].getObjects().length > 1 ? true : false;
            var is_check_2 = list_item_compare[index_switch_2].getObjects().length > 1 ? true : false;
            canvas.remove(list_item_compare[index_switch_1]);
            canvas.remove(list_item_compare[index_switch_2]);
            if (is_check_1 == true) list_selecteditem_compare.splice(list_selecteditem_compare.indexOf(list_item_compare[index_switch_1]), 1);
            if (is_check_2 == true) list_selecteditem_compare.splice(list_selecteditem_compare.indexOf(list_item_compare[index_switch_2]), 1);
            addImageItem(index_switch_1, list_image_compare.length, list_image_compare[index_switch_1], false, is_check_2);
            addImageItem(index_switch_2, list_image_compare.length, list_image_compare[index_switch_2], false, is_check_1);
            setTimeout(function() { index_switch_1 = index_switch_2 = -1; }, 1000);
        } else {
            relocateImageItem(list_image_compare.length);
        }
    }
});
canvas.on('mouse:over',function(o) {
    if (item_type == ITEM_TYPE.ERASER && isDown == true) remove_object(o.target);
});
canvas.on('mouse:out', function(o) {
});
canvas.on('mouse:down', function(o) {
    isDown = true;
    if (o.target == item_mask && item_type != ITEM_TYPE.ZOOM && item_type != ITEM_TYPE.SELECT && item_type != ITEM_TYPE.ERASER) is_draw_start_over_mask = true;
    if (o.target == item_highlight && item_type != ITEM_TYPE.ZOOM && item_type != ITEM_TYPE.SELECT && item_type != ITEM_TYPE.ERASER) is_draw_start_over_highlight = true;
    var pointer = canvas.getPointer(o.e);
    if (item_type == ITEM_TYPE.ZOOM) {
        rangeX = pointer.x;
        rangeY = pointer.y;
    }
    var rect = o.e.target.getBoundingClientRect();
    if (o.e.clientX !== undefined) {
        pointer.x = o.e.clientX - rect.left;
        pointer.y = o.e.clientY - rect.top;
    } else {
        pointer.x = o.e.touches[0].clientX - rect.left;
        pointer.y = o.e.touches[0].clientY - rect.top;
    }
    origX = pointer.x;
    origY = pointer.y;
    down(pointer);
    o.e.preventDefault();
});
canvas.on('mouse:move', function(o) {
    if (!isDown) return;
    var rect = o.e.target.getBoundingClientRect();
    var pointer = canvas.getPointer(o.e);
    if (o.e.clientX !== undefined) {
        pointer.x = o.e.clientX - rect.left;
        pointer.y = o.e.clientY - rect.top;
    } else {
        pointer.x = o.e.touches[0].clientX - rect.left;
        pointer.y = o.e.touches[0].clientY - rect.top;
    }
    if (o.target == item_highlight && is_highlight == true && item_type == ITEM_TYPE.SELECT) {
        var w = Math.ceil(item_highlight.width * item_highlight.scaleX);
        var h = Math.ceil(item_highlight.height * item_highlight.scaleY);
        var x_bg = canvas.width % -2 == 0 ? Math.ceil(canvas.width / -2) : canvas.width / -2;
        var y_bg = canvas.height % -2 == 0 ? Math.ceil(canvas.height / -2) : canvas.height / -2;
        item_highlight_bg_t.set({ clipTo: function (ctx) { ctx.rect(x_bg, y_bg, canvas.width, Math.ceil(item_highlight.top)); } });
        item_highlight_bg_b.set({ clipTo: function (ctx) { ctx.rect(x_bg, y_bg + Math.ceil(item_highlight.top) + h, canvas.width, canvas.height - Math.ceil(item_highlight.top) - h); } });
        item_highlight_bg_l.set({ clipTo: function (ctx) { ctx.rect(x_bg, y_bg + Math.ceil(item_highlight.top), item_highlight.left, h); } });
        item_highlight_bg_r.set({ clipTo: function (ctx) { ctx.rect(x_bg + item_highlight.left + w, y_bg + Math.ceil(item_highlight.top), canvas.width - item_highlight.left - w, h); } });
        canvas.renderAll();
    }
    move(pointer, o);
    o.e.preventDefault();
});
canvas.on('mouse:up', function(o) {
    isDown = false;
    var pointer = canvas.getPointer(o.e);
    var rect = o.e.target.getBoundingClientRect();
    if (o.e.clientX !== undefined) {
        pointer.x = o.e.clientX - rect.left;
        pointer.y = o.e.clientY - rect.top;
    } else {
/*
        pointer.x = o.e.touches[0].clientX - rect.left;
        pointer.y = o.e.touches[0].clientY - rect.top;
*/
    }
    if (item_type != ITEM_TYPE.ZOOM && is_show_setting == true) {
        hideSetting();
        if (Math.abs(origX - pointer.x) == 0 && Math.abs(origY - pointer.y) == 0 && (item_type == ITEM_TYPE.LINE_FREE_PEN || item_type == ITEM_TYPE.LINE_FREE_MARKER)) {
            canvas.remove(canvas._objects[canvas._objects.length -1]);
            canvas.renderAll();
        }
    }
    if (index_switch_1 == -1 && index_switch_2 == -1 && item_type == ITEM_TYPE.SELECT &&  list_item_compare.includes(o.target)) {
        var index = list_item_compare.indexOf(o.target);
        var item = list_item_compare[index];
        canvas.remove(item);
        if (item.getObjects().length == 1) {
            addImageItem(index, list_image_compare.length, list_image_compare[index], false, true);
        } else {
            list_selecteditem_compare.splice(list_selecteditem_compare.indexOf(item), 1);
            addImageItem(index, list_image_compare.length, list_image_compare[index], false, false);
        }
        canvas.renderAll();
    }
    up(pointer);
    o.e.preventDefault();
});
canvas.on('selection:created', function () {
    if (item_type != ITEM_TYPE.ERASER) return;
    remove_object(canvas.getActiveObject());
});

/* ------------------------------------------------------------------------------------------------ */
var item_type_tmp = "line_free_pen";
addEventListener("contextmenu", function(e){
    e.preventDefault();
}, false);
addEventListener("mousedown", function(e){
    switch (e.button) {
        case 1 :
        case 2 :
            if (scale_zoom == 1.0) {
                isDown = true;
                item_type_tmp = item_type;
                setItemType(ITEM_TYPE.ERASER);
            }
            break;
    }
}, false);
addEventListener("mouseup", function(e){
    switch (e.button) {
        case 1 :
        case 2 :
            if (is_show_setting == true) {
                hideSetting();
            }
            if (scale_zoom == 1.0) {
                isDown = false;
                setItemType(item_type_tmp);
            }
            break;
    }
}, false);
/*
addEventListener("keydown", function(e) {
    if (item_type != ITEM_TYPE.TEXT) {
        var is_focus_zoomrange = $('.zoomrange').is(':focus');
        if (e.keyCode == 13) {
            canvas.getActiveObject().clone(function(cloned) {
                cloned.clone(function(clonedObj) {
                    canvas.discardActiveObject();
                    clonedObj.set({
                        left: clonedObj.left + 10,
                        top: clonedObj.top + 10,
                        evented: true,
                    });
                    if (clonedObj.type === 'activeSelection') {
                        clonedObj.canvas = canvas;
                        clonedObj.forEachObject(function(obj) {
                            canvas.add(obj);
                        });
                        clonedObj.setCoords();
                    } else {
                        canvas.add(clonedObj);
                    }
                    cloned.top += 10;
                    cloned.left += 10;
                    canvas.setActiveObject(clonedObj);
                    canvas.requestRenderAll();
                });
            });
        } else if (e.keyCode == 27) {
            window.close();
        } else if (e.keyCode == 32) {
            if (background_type == "camera" || background_type == "movie") freeze(false);
        } else if (e.keyCode == 37 && is_focus_zoomrange == false) {
            undo();
        } else if (e.keyCode == 38 && is_focus_zoomrange == false) {
            canvas.bringForward(canvas.getActiveObject());
            canvas.renderAll();
        } else if (e.keyCode == 39 && is_focus_zoomrange == false) {
            redo();
        } else if (e.keyCode == 40 && is_focus_zoomrange == false) {
            canvas.sendBackwards(canvas.getActiveObject());
            canvas.renderAll();
        } else if (e.keyCode == 8 || e.keyCode == 46) {
            remove_object(canvas.getActiveObject());
        }
    }
}, false);
*/
/* ------------------------------------------------------------------------------------------------ */
addEventListener("touchstart", function(e) {
    touchstart_bar = 0;
    touchmove_bar = 0;
    if (e.touches.length > 1) {
        canvas.isDrawingMode = false;
        w_abs_start = Math.abs(e.touches[1].pageX - e.touches[0].pageX);
        h_abs_start = Math.abs(e.touches[1].pageY - e.touches[0].pageY);
        touchstart_bar = w_abs_start*h_abs_start;
    }
}, false);
addEventListener("touchmove", function(e) {
    if (e.touches.length > 1) {
        w_abs_move = Math.abs(e.touches[1].pageX - e.touches[0].pageX);
        h_abs_move = Math.abs(e.touches[1].pageY - e.touches[0].pageY);
        touchmove_bar = w_abs_move*h_abs_move;
        area_bar = touchstart_bar-touchmove_bar;
        if (area_bar < 0) {
            scale_zoom = parseFloat(scale_zoom) + parseFloat(0.2);
        } else if (area_bar > 0) {
            scale_zoom = parseFloat(scale_zoom) - parseFloat(0.2);
        }
        if (scale_zoom < 1.0) {
            scale_zoom = 1.0;
        } else if (scale_zoom > 8.0) {
            scale_zoom = 8.0;
        }
        $("input[type=range]").val(scale_zoom).change();
    }
}, false);
function remove_object(obj) {
    if (item_mask == obj) return;
    if (item_highlight == obj || item_highlight_bg_t == obj || item_highlight_bg_b == obj || item_highlight_bg_l == obj || item_highlight_bg_r == obj) return;
    if (list_item_compare.includes(obj)) return;
    if (item_timer == obj) return;
    listUndo.push(obj);
    canvas.remove(obj);
    canvas.renderAll();
}

/* ------------------------------------------------------------------------------------------------ */
var list_image_compare = [];
var list_item_compare = [];
var list_path_compare = [];
var list_selecteditem_compare = [];
/*
$(function() {
    if (!window.FileReader) {
        alert("not supported File API.");
        return false;
    }
    var droparea = $("#draw");
    var cancelEvent = function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    droparea.bind("dragleave", function(e) { });
    droparea.bind("dragenter", cancelEvent);
    droparea.bind("dragover", cancelEvent);
    droparea.bind("drop", cancelEvent);
    droparea.bind("drop", function(e) {
        cancelEvent(e);
        is_compare = true;
        var length = list_image_compare.length + e.originalEvent.dataTransfer.files.length;
        for (var i = 0; i < e.originalEvent.dataTransfer.files.length; i++) {
            var file = e.originalEvent.dataTransfer.files[i];
            if (list_path_compare.indexOf(file.name) < 0 && (file.name.includes(".png") || file.name.includes(".jpg") || file.name.includes(".jpeg") || file.name.includes(".bmp"))) {
                list_path_compare.push(file.name);
            } else {
                length--;
                continue;
            }
            console.log(file.name);
            loadImageItem(length - e.originalEvent.dataTransfer.files.length + i, length, file);
        }
        setTimeout(function() {
            var list = [];
            for (var i = 0; i < list_path_compare.length; i++) {
                for (var j = 0; j < list_image_compare.length; j++) {
                    var img = list_image_compare[j];
                    if (list_path_compare[i].includes(img.cacheKey)) {
                        list.splice(i, 0, img);
                    }
                }
            }
            list_image_compare = list;
            relocateImageItem(length);
        }, e.originalEvent.dataTransfer.files.length * 100);
        return false;
    });
});
*/
function loadImageItem(i, length, file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        fabric.Image.fromURL(reader.result, function(img) {
            if (i < 9) {
                img.set({ cacheKey: file.name });
                list_image_compare.push(img);
            }
        });
    };
    reader.readAsDataURL(file);
}
function relocateImageItem(length) {
    var list_checked = [];
    for (var i = 0; i < list_item_compare.length; i++) {
        if (list_item_compare[i].getObjects().length > 1) {
            list_selecteditem_compare.splice(list_selecteditem_compare.indexOf(list_item_compare[i]), 1);
            list_checked.push(i);
        }
        canvas.remove(list_item_compare[i]);
    }
    list_item_compare = [];
    canvas.backgroundColor = "rgba(0, 0, 0, 1.0)";
    for (var i = 0; i < list_image_compare.length; i++) {
        addImageItem(i, length, list_image_compare[i], true, list_checked.includes(i));
    }
}
var canvas_w = 0, canvas_h = 0, margin_compare = 5;
function addImageItem(index, length, img, is_reglist, is_check) {
    if (length == 1) {
        canvas_w = Math.ceil((canvas.width - margin_compare * 4) / 1); canvas_h = Math.ceil(canvas.height / 1);
    } else if (length == 2) {
        canvas_w = Math.ceil((canvas.width - margin_compare * 4) / 2); canvas_h = Math.ceil(canvas.height / 1);
    } else if (3 <= length && length <= 4) {
        canvas_w = Math.ceil((canvas.width - margin_compare * 4) / 2); canvas_h = Math.ceil((canvas.height - margin_compare * 4) / 2);
    } else if (5 <= length && length <= 6) {
        canvas_w = Math.ceil((canvas.width - margin_compare * 6) / 3); canvas_h = Math.ceil((canvas.height - margin_compare * 4) / 2);
    } else {
        canvas_w = Math.ceil((canvas.width - margin_compare * 6) / 3); canvas_h = Math.ceil((canvas.height - margin_compare * 6) / 3);
    }
    var canvasAspect = canvas_w / canvas_h;
    var imgAspect = img.width / img.height;
    var left, top, scaleFactor;
    if (canvasAspect <= imgAspect) {
        scaleFactor = canvas_w / img.width;
    } else {
        scaleFactor = canvas_h / img.height;
    }
    if (index == 0) {
        if (canvasAspect <= imgAspect) {
            left = margin_compare; top = -((img.height * scaleFactor) - canvas_h) / 2 + margin_compare;
        } else {
            left = -((img.width * scaleFactor) - canvas_w) / 2 + margin_compare; top = margin_compare;
        }
    } else if (index == 1) {
        if (canvasAspect <= imgAspect) {
            left = canvas_w + margin_compare * 3; top = -((img.height * scaleFactor) - canvas_h) / 2 + margin_compare;
        } else {
            left = -((img.width * scaleFactor) - canvas_w) / 2 + canvas_w + margin_compare * 3; top = margin_compare;
        }
    } else if (index == 2) {
        if (3 <= length && length <= 4) {
            if (canvasAspect <= imgAspect) {
                left = margin_compare; top = -((img.height * scaleFactor) - canvas_h) / 2 + canvas_h + margin_compare * 3;
            } else {
                left = -((img.width * scaleFactor) - canvas_w) / 2 + margin_compare; top = canvas_h + margin_compare * 3;
            }
        } else {
            if (canvasAspect <= imgAspect) {
                left = canvas_w * 2 + margin_compare * 5; top = -((img.height * scaleFactor) - canvas_h) / 2 + margin_compare;
            } else {
                left = -((img.width * scaleFactor) - canvas_w) / 2 + canvas_w * 2 + margin_compare * 5; top = margin_compare;
            }
        }
    } else if (index == 3) {
        if (3 <= length && length <= 4) {
            if (canvasAspect <= imgAspect) {
                left = canvas_w + margin_compare * 3; top = -((img.height * scaleFactor) - canvas_h) / 2 + canvas_h + margin_compare * 3;
            } else {
                left = -((img.width * scaleFactor) - canvas_w) / 2 + canvas_w + margin_compare * 3; top = canvas_h + margin_compare * 3;
            }
        } else {
            if (canvasAspect <= imgAspect) {
                left = margin_compare; top = -((img.height * scaleFactor) - canvas_h) / 2 + canvas_h + margin_compare * 3;
            } else {
                left = -((img.width * scaleFactor) - canvas_w) / 2 + margin_compare; top = canvas_h + margin_compare * 3;
            }
        }
    } else if (index == 4) {
        if (canvasAspect <= imgAspect) {
            left = canvas_w + margin_compare * 3; top = -((img.height * scaleFactor) - canvas_h) / 2 + canvas_h + margin_compare * 3;
        } else {
            left = -((img.width * scaleFactor) - canvas_w) / 2 + canvas_w + margin_compare * 3; top = canvas_h + margin_compare * 3;
        }
    } else if (index == 5) {
        if (canvasAspect <= imgAspect) {
            left = canvas_w * 2 + margin_compare * 5; top = -((img.height * scaleFactor) - canvas_h) / 2 + canvas_h + margin_compare * 3;
        } else {
            left = -((img.width * scaleFactor) - canvas_w) / 2 + canvas_w * 2 + margin_compare * 5; top = canvas_h + margin_compare * 3;
        }
    } else if (index == 6) {
        if (canvasAspect <= imgAspect) {
            left = margin_compare; top = -((img.height * scaleFactor) - canvas_h) / 2 + canvas_h * 2 + margin_compare * 5;
        } else {
            left = -((img.width * scaleFactor) - canvas_w) / 2 + margin_compare; top = canvas_h * 2 + margin_compare * 5;
        }
    } else if (index == 7) {
        if (canvasAspect <= imgAspect) {
            left = canvas_w + margin_compare * 3; top = -((img.height * scaleFactor) - canvas_h) / 2 + canvas_h * 2 + margin_compare * 5;
        } else {
            left = -((img.width * scaleFactor) - canvas_w) / 2 + canvas_w + margin_compare * 3; top = canvas_h * 2 + margin_compare * 5;
        }
    } else if (index == 8) {
        if (canvasAspect <= imgAspect) {
            left = canvas_w * 2 + margin_compare * 5; top = -((img.height * scaleFactor) - canvas_h) / 2 + canvas_h * 2 + margin_compare * 5;
        } else {
            left = -((img.width * scaleFactor) - canvas_w) / 2 + canvas_w * 2 + margin_compare * 5; top = canvas_h * 2 + margin_compare * 5;
        }
    } else {
        return;
    }
    var item = img.set({ top: top, left: left, originX: 'left', originY: 'top', scaleX: scaleFactor, scaleY: scaleFactor, stroke: "black", strokeWidth : margin_compare  });
    var check = fabric.util.object.clone(item_check);
    check.set({top: top, left: left});
    canvas.discardActiveObject();
    var group = null;
    if (is_check == true) {
        group = new fabric.Group([ item, check ], { top: top, left: left, angle: 0 });
        list_selecteditem_compare.splice(list_selecteditem_compare.length, 0, group);
    } else {
        group = new fabric.Group([ item ], { top: top, left: left, angle: 0 });
    }
    group.hasControls = group.hasBorders = false;
    canvas.add(group);
    canvas.sendToBack(group);
    if (is_reglist == true) {
        list_item_compare.splice(index, 0, group);
    } else {
        list_item_compare.splice(index, 1, group);
    }
    canvas.discardActiveObject();
    canvas.renderAll();
}
var item_check;
fabric.Image.fromURL("./" + useLanguage + "/images/Check.png", function(img) {
    item_check = img.set({ top: 0, left: 0 });
    item_check.scaleToWidth(100);
    item_check.scaleToHeight(100);
});
