function showLoginModal() {
    document.getElementById("signupModal").style.display = "none";
    document.getElementById("loginModal").style.display = "block";
}

function showSignupModal() {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("signupModal").style.display = "block";
}

function closeModal() {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("signupModal").style.display = "none";
}

window.onclick = function(event) {
    if (event.target == document.getElementById("loginModal") || event.target == document.getElementById("signupModal")) {
        closeModal();
    }
}
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/login', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        var response = JSON.parse(xhr.responseText);
        if (xhr.status === 200) {
            window.location.href = response.redirectUrl;
        } else {
            document.getElementById('errorMessage').textContent = response.message;
        }
    };
    xhr.send(JSON.stringify({username: username, password: password}));
});
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    var username = document.getElementById('username1').value;
    var password = document.getElementById('password1').value;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/register', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        var response = JSON.parse(xhr.responseText);
        if (xhr.status === 200) {
            closeModal();
            showLoginModal();
            document.getElementById('successMessage').textContent = response.message;
        } else {
            document.getElementById('registerMessage').textContent = response.error;
        }
    };
    xhr.send(JSON.stringify({username1: username, password1: password}));
});