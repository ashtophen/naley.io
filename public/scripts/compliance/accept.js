const choose = document.createElement('div');
const flexBtns = document.createElement('div');
const acceptBox = document.createElement('div');
const denyBox = document.createElement('div');
const denyBtn = document.createElement('button');
const acceptBtn = document.createElement('button');
//choose.style.display
flexBtns.appendChild(denyBox);
denyBox.appendChild(denyBtn);
acceptBox.appendChild(acceptBtn);
flexBtns.appendChild(acceptBox);
choose.appendChild(flexBtns);
const body = document.body;
choose.innerHTML = `Do You Consent To naley.io Using Cookies As Outlined In Our&nbsp<a href="/cookieconsentpolicy.html">Cookie Consent Policy</a>?`;
acceptBox.textContent = "Allow All Cookies"
denyBox.textContent = "Essential Cookies Only"
//styling
choose.style.position = "absolute";
choose.className = "modal";
//choose.style.display = "flex";

body.insertBefore(choose, body.firstChild);