document.addEventListener('DOMContentLoaded', function() {
    const navbarMenu = document.getElementsByClassName('navbar')[0];

    window.openHamburgerMenu = function() {
        navbarMenu.classList.add('show');
    }

    window.closeHamburgerMenu = function() {
        navbarMenu.classList.remove('show');
    }
});
