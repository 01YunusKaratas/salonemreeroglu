document.addEventListener('DOMContentLoaded', function() {
    const timeSelect = document.getElementById('time');

    
    for (let hour = 10; hour <= 22; hour++) {
        const option = document.createElement('option');
        option.value = `${hour}:00`;
        option.text = `${hour}:00`;
        timeSelect.appendChild(option);
    }
});

// Form gönderimi için event listener ekledik
document.getElementById('appointment-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Sayfanın yeniden yüklenmesini engeller

    const formData = new FormData(this);

    fetch('/appointment', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Randevu başarıyla alındı.');
            this.reset();
        } else {
            alert('Bir hata oluştu: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Bir hata oluştu, lütfen tekrar deneyin.');
    });

    
});


