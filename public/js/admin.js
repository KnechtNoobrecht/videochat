function initModerator(params) {
    console.log('ModJS!');

    var elem = `
    <div id="" onclick="openAdmin()" class="bot_bar_item"> 
        <img src="/svg/cog.svg"/>
        <span> Admin </span> 
    </div>`
    document.querySelector('.bot_bar').innerHTML += elem;
    //document.getElementById('bot_bar').appendChild(elem)
    var elem1 = `
    <modal id="AdminModal" class="hide">
        <div class="modal-content  col-6">
            <div class="modal-header  col-6">
                <h2>Room Settings</h2>
                <button class="btn form-input" onclick="modals.AdminModal.close()">X</button>
            </div>
            <div class="modal-body  col-6">
                <p>Some text in the Modal Body</p>
                <p>Some other text...</p>
            </div>
            <div class="modal-footer  col-6">
                <button class="btn form-input" onclick="saveAdmin()">Save</button>
            </div>
        </div>
    </modal>`
    document.body.innerHTML += elem1;
    initModals()
}

//initModerator();

function openAdmin(params) {
    console.log('openAdmin');
    modals.AdminModal.open();
}