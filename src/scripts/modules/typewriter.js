export function setupTypewriter() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('typed')) {
                entry.target.classList.add('typed');
                typeText(entry.target);
            }
        });
    }, { threshold: 0.8 });

    document.querySelectorAll('.section-title, .about-heading').forEach(el => {
        el.dataset.text = el.innerText;
        el.innerText = '';
        observer.observe(el);
    });
}

function typeText(element) {
    const text = element.dataset.text;
    element.innerHTML = '';
    
    // Create a wrapper to keep things grouped and centered
    const wrapper = document.createElement('span');
    wrapper.style.display = 'inline-flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';

    const promptSpan = Object.assign(document.createElement('span'), { 
        className: 'typewriter-prompt', 
        innerText: '> ' 
    });
    const textSpan = document.createElement('span');
    const cursor = Object.assign(document.createElement('span'), { 
        className: 'typewriter-cursor', 
        innerText: '|' 
    });
    
    wrapper.append(promptSpan, textSpan, cursor);
    element.append(wrapper);

    let i = 0;
    const typeChar = () => {
        if (i < text.length) {
            textSpan.textContent += text.charAt(i++);
            setTimeout(typeChar, Math.random() * 30 + 30);
        } else {
            setTimeout(() => { 
                cursor.style.display = 'none'; 
                
                // Smoothly collapse the prompt width to 0 so the header snaps perfectly to dead center
                promptSpan.style.transition = 'opacity 0.3s ease, width 0.3s ease';
                promptSpan.style.display = 'inline-block';
                promptSpan.style.overflow = 'hidden';
                promptSpan.style.whiteSpace = 'nowrap';
                promptSpan.style.width = '1.5rem'; // Give it its starting approximate width
                
                requestAnimationFrame(() => {
                    promptSpan.style.width = '0px';
                    promptSpan.style.opacity = '0';
                });
                
                setTimeout(() => promptSpan.remove(), 300);
            }, 1000);
        }
    };
    setTimeout(typeChar, 180);
}
