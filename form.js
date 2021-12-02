//bounds for date pickers
var today = new Date().toISOString().split("T")[0];
move_in_date.min = today;
birth_date.max = today;

//make canvas focusable
for (canvas of document.getElementsByClassName("signature_canvas")) {
    canvas.tabIndex = -1;
}

//hiding/revealing things
function toggleVis(toggle_elem, condition_elem, toggle_val="yes") {
    condition_elem.addEventListener("change", function(event) {
        toggle_elem.style.display = condition_elem.value === toggle_val ? "block" : "none";
        toggle_elem.querySelectorAll("input, label").forEach(function(element) {
            if (toggle_elem.style.display === "block")
                element.classList.remove("optional");
            else
                element.classList.add("optional");
        });
        console.log(toggle_elem);
    });
}

toggleVis(pets, is_pets);
toggleVis(agent_info, referred_by, "agent");
toggleVis(is_military_limit_vis, is_military);
toggleVis(crime_details, convicted_crime);
toggleVis(sex_offense_details, sex_offender);

function variableInputs(parent, clone_button, delete_button) {
    clone_button.addEventListener("click", function(event) {
        function changeNum(str) {
            return str.replace(/[0-9]+/, parent.children.length + 1);
        }
        event.preventDefault();

        console.log(parent);
        var to_clone = parent.children[0];
        var clone = to_clone.cloneNode(true);
        clone.querySelectorAll("input").forEach(x => x.value = "");
        var name = changeNum(clone.querySelector("name, select").getAttribute("name"));
        clone.querySelectorAll("input, select, label").forEach(function(item) {
            if (item.nodeName == "LABEL") {
                item.setAttribute("for", changeNum(item.getAttribute("for")));
                return;
            }
            if (item.nodeName == "SELECT")
                item.selectedIndex = 0;
            item.setAttribute("name", name);
            item.setAttribute("id", changeNum(item.getAttribute("id")));
        });
        parent.appendChild(clone);
    });

    delete_button.addEventListener("click", function(event) {
        event.preventDefault();
        if (parent.children.length <= 1)
            return;
        parent.removeChild(parent.lastChild);
    })
}
variableInputs(document.getElementById("other_persons_parent"),
    document.getElementById("other_persons_clone_button"), 
    document.getElementById("other_persons_delete_button"));
variableInputs(document.getElementById("vehicles_parent"),
    document.getElementById("vehicles_clone_button"),
    document.getElementById("vehicles_delete_button"));
variableInputs(document.getElementById("pets_parent"),
    document.getElementById("pets_clone_button"),
    document.getElementById("pets_delete_button"));

function makeSignatureCanvas(canvas, resetButton) {
    window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimaitonFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#00B14A";
    ctx.lineWidth = 4;

    var drawing = false;
    var mousePos = {
        x: 0,
        y: 0
    };
    var lastPos = mousePos;

    canvas.addEventListener("mousedown", function(e) {
        drawing = true;
        lastPos = getMousePos(canvas, e);
    }, false);
    
    canvas.addEventListener("mouseup", function(e) {
        drawing = false;
    }, false);
    
    canvas.addEventListener("mousemove", function(e) {
        mousePos = getMousePos(canvas, e);
    }, false);
    
    // Add touch event support for mobile
    canvas.addEventListener("touchmove", function(e) {
        var touch = e.touches[0];
        var me = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(me);

        e.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener("touchstart", function(e) {
        mousePos = getTouchPos(canvas, e);
        var touch = e.touches[0];
        var me = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(me);

        e.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener("touchend", function(e) {
        var me = new MouseEvent("mouseup", {});
        canvas.dispatchEvent(me);
        e.preventDefault();

    }, { passive: false });

    function getMousePos(canvasDom, mouseEvent) {
        var rect = canvasDom.getBoundingClientRect();
        return {
          x: mouseEvent.clientX - rect.left,
          y: mouseEvent.clientY - rect.top
        }
    }
    
    function getTouchPos(canvasDom, touchEvent) {
        var rect = canvasDom.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top
        }
    }
    
    function renderCanvas() {
        if (drawing) {
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(mousePos.x, mousePos.y);
            ctx.stroke();
            lastPos = mousePos;
        }
    }
    
    (function drawLoop() {
        requestAnimFrame(drawLoop);
        renderCanvas();
    })();

    resetButton.addEventListener("click", function(event) {
        event.preventDefault();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
    })
}

makeSignatureCanvas(
    document.getElementById("signature_canvas"), 
    document.getElementById("signature_reset"));
makeSignatureCanvas(
    document.getElementById("signature_canvas2"),
    document.getElementById("signature_reset2")
);

