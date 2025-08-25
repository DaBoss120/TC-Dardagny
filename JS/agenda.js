window.addEventListener('DOMContentLoaded', function() {
    agendaElementsAppear();
});

function agendaElementsAppear() {
    document.querySelectorAll('.agendaElement').forEach((agendaElement, index) => {
        setTimeout(() => {
        agendaElement.style.opacity = 1;
        agendaElement.style.transform = 'translateY(0)';
        agendaElement.style.filter = 'blur(0px)';
        }, 150 * (index + 1)); // Delay increases with each element
    });
}