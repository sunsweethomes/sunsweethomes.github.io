(function() {
  // get all data in form and return object
  function getFormData(form) {
    //populate hidden input field with canvas DataURL
    document.getElementById("signature").value = document.getElementById("signature_canvas").toDataURL();
    document.getElementById("signature2").value = document.getElementById("signature_canvas2").toDataURL();

    var elements = form.elements;
    var honeypot;
    
    console.log(Object.keys(elements));
    var fields = Object.keys(elements).filter(function(k) {
      if (elements[k].name === "honeypot") {
        honeypot = elements[k].value;
        return false;
      }
      return true;
    }).map(function(k) {
      if(elements[k].name !== undefined) {
        return elements[k].name;
      // special case for Edge's html collection
      }else if(elements[k].length > 0){
        return elements[k].item(0).name;
      }
    }).filter(function(item, pos, self) {
      return self.indexOf(item) == pos && item;
    })


    var formData = {};

    fields.forEach(function(name){
      console.log(name);

      var element = elements[name];
      
      // singular form elements just have one value
      formData[name] = element.value;

      // when our element has multiple items, get their values
      if (element.length) {
        console.log(element);
        var data = [];
        for (var i = 0; i < element.length; i++) {
          console.log(element.item(i).value);

          var item = element.item(i);
          if (item.checked || item.selected || item.nodeName == "SELECT" || item.nodeName == "INPUT") {
            console.log("hey2");
            data.push(item.value);
          }
        }
        formData[name] = data.join(', ');
      }
    });

    // add form-specific values into the data
    formData.formDataNameOrder = JSON.stringify(fields);
    formData.formGoogleSheetName = form.dataset.sheet || "responses"; // default sheet name
    formData.formGoogleSendEmail
      = form.dataset.email || ""; // no email by default

    return {data: formData, honeypot: honeypot};
  }

  function handleFormSubmit(event) {  // handles form submit without any jquery
    event.preventDefault();           // we are submitting via xhr below
    var form = event.target;
    var canvases = document.getElementsByClassName("signature_canvas")
    
    //validation
    for (var i = 0, element; element = form.elements[i++];) {
      console.log(element.classList);
      if ((((element.nodeName === "INPUT" || element.nodeName === "TEXTAREA") && element.value === element.defaultValue) ||
        (element.nodeName === "SELECT" && element.selectedIndex === 0)) &&
        !element.classList.contains("optional")){

        if (confirm("This form has unfilled fields. Are you sure you want to submit?")) {
          break;
        } else {
          element.focus();
          return false;
        }
      }
    }
    for (canvas of canvases) {
      console.log(canvas);

      if (!canvas.getContext('2d')
        .getImageData(0, 0, canvas.width, canvas.height).data
        .some(channel => channel !== 0)) {
          canvas.focus();
          alert("Please sign the canvas.");
          return false;
        }
    };

    var formData = getFormData(form);
    var data = formData.data;

    // If a honeypot field is filled, assume it was done so by a spam bot.
    if (formData.honeypot) {
      return false;
    }

    //disableAllButtons(form);
    var url = form.action;
    var xhr = new XMLHttpRequest();
    var status = document.getElementById("status");

    xhr.open('POST', url);
    // xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
          console.log(xhr.status);

          if (xhr.status == 200) {
              console.log("request completed succesfully");
              //https://betterprogramming.pub/how-to-restart-a-css-animation-with-javascript-and-what-is-the-dom-reflow-a86e8b6df00f
              status.classList.remove("success");
              void status.offsetWidth; //trigger a DOM reflow
              status.classList.add("success");
              status.innerHTML = "Success";
              for (canvas of canvases) {
                clearCanvas(canvas);
              }

          } else {
              console.log("oops, error");
              status.classList.remove("error");
              void status.offsetWidth;
              status.classList.add("error");
              status.innerHTML = "Oops! There was an error";
          }
      }
    };

      // url encode form data for sending as post data
      var encoded = Object.keys(data).map(function(k) {
          return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
      }).join('&');
      xhr.send(encoded);
  }
  
  function loaded() {
    // bind to the submit event of our form
    var forms = document.querySelectorAll("form.gform");
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener("submit", handleFormSubmit);
    }
  };
  document.addEventListener("DOMContentLoaded", loaded, false);

  function disableAllButtons(form) {
    var buttons = form.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
  }

  function clearCanvas(canvas) {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
  }
})();