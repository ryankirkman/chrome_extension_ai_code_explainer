document.getElementById('optionsForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const apiKey = document.getElementById('apiKey').value;
    const model = document.getElementById('model').value;
    const maxTokens = document.getElementById('maxTokens').valueAsNumber;
    const temperature = document.getElementById('temperature').valueAsNumber;
    const liveResponse = document.getElementById('liveResponse').checked;

    chrome.storage.local.set({ apiKey, model, maxTokens, temperature, liveResponse }, function () {
        alert('Settings saved');
    });
});

chrome.storage.local.get(['apiKey', 'model', 'maxTokens', 'temperature', 'liveResponse'], function (data) {
    document.getElementById('apiKey').value = data.apiKey || '';
    document.getElementById('model').value = data.model || 'gpt-3.5-turbo';
    document.getElementById('maxTokens').valueAsNumber = data.maxTokens || 500;
    document.getElementById('temperature').valueAsNumber = data.temperature || 0.5;
    // default to true
    if(data.liveResponse === undefined) data.liveResponse = true;
    document.getElementById('liveResponse').checked = data.liveResponse;
});