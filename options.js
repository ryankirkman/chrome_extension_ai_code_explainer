document.getElementById('optionsForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const apiKey = document.getElementById('apiKey').value;
    const model = document.getElementById('model').value;
    const maxTokens = document.getElementById('maxTokens').valueAsNumber;
    const temperature = document.getElementById('temperature').valueAsNumber;

    chrome.storage.local.set({ apiKey, model, maxTokens, temperature }, function () {
        alert('Settings saved');
    });
});

chrome.storage.local.get(['apiKey', 'model', 'maxTokens', 'temperature'], function (data) {
    document.getElementById('apiKey').value = data.apiKey || '';
    document.getElementById('model').value = data.model || 'gpt-3.5-turbo';
    document.getElementById('maxTokens').valueAsNumber = data.maxTokens || 500;
    document.getElementById('temperature').valueAsNumber = data.temperature || 0.5;
});