// Update score with GSAP animation
function updateScore(team, delta) {
    const el = document.getElementById(`score-${team}`);
    let score = parseInt(el.textContent, 10) + delta;
    score = Math.max(0, score);

    // Animate score scale
    gsap.fromTo(el,
        { scale: 1 },
        {
            scale: 1.3,
            duration: 0.2,
            ease: "power2.out",
            onComplete: () => {
                el.textContent = score;
                gsap.to(el, { scale: 1, duration: 0.2, ease: "power2.inOut" });
            }
        }
    );
}

// Handle + and – button presses
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const team = btn.dataset.team;
        const delta = btn.classList.contains('plus') ? 1 : -1;

        // Animate button tap
        gsap.fromTo(btn,
            { scale: 1 },
            { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1, ease: "power1.inOut" }
        );

        updateScore(team, delta);
    });
});

// Handle edit pencil click
document.querySelectorAll('.edit-name').forEach(button => {
    button.addEventListener('click', () => {
        const input = button.previousElementSibling;
        input.removeAttribute('readonly');
        input.focus();
        input.select();

        // Animate name input
        gsap.fromTo(input,
            { scale: 1 },
            { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" }
        );
    });
});

// Lock name again on blur or Enter
document.querySelectorAll('.team-name').forEach(input => {
    input.addEventListener('blur', () => {
        input.setAttribute('readonly', true);
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            input.blur(); // Triggers blur handler above
        }
    });
});
