export default class Controller {
    constructor(xhr) {
        this.xhr = xhr;
        this.addTicketButton = document.getElementsByClassName('button__add').item(0);
        this.modalAdd = document.getElementsByClassName('modal-add').item(0);
        this.modalEdit = document.getElementsByClassName('modal-edit').item(0);
        this.modalDelete = document.getElementsByClassName('modal-delete').item(0);
        this.addForm = document.getElementsByClassName('modal-add__form').item(0);
        this.editForm = document.getElementsByClassName('modal-edit__form').item(0);
        this.cancelButtons = document.getElementsByClassName('cancel');
        this.deleteButton = document.getElementsByClassName('modal-delete__send').item(0);
        this.modalAddError = document.getElementsByClassName('modal-add__error').item(0);
        this.modalEditError = document.getElementsByClassName('modal-edit__error').item(0);
        this.tiketsBox = document.getElementsByClassName('tickets').item(0); 
        this.activeModal = null;
        this.activeTicket = null;
        this.checkMark = null;
        this.background = document.getElementsByClassName('background').item(0);
    }

    init() {
        this.redrawTickets();
        this.listener();
    }

    redrawTickets() {
        this.xhr.getAllTickets().then(tickets => {
            if(tickets.length) {
                JSON.parse(tickets).forEach(ticket => {
                    const {description} = ticket;
                    const {created} = ticket;
                    const {id} = ticket;
                    this.createTicket(description, created, id);
                });
            }  
        });
    }

    listener() {
        this.openFormAdd();
        this.addTicket();
        this.editTicket();
        this.cancelTicket();
        this.deleteTicket();
    }

    clearFormValue() {
        this.addForm.elements.descAdd.value = '';
        this.addForm.elements.fullAdd.value = '';
    }
    
    getCheckMark(el) {
        if(this.checkMark) this.checkMark.innerText = "";
        this.checkMark = el.getElementsByClassName('ticket__choice').item(0);
        this.checkMark.innerText = '\u{2714}';
    }

    openFormAdd() {
        this.addTicketButton.addEventListener('click', () => {
            this.background.classList.toggle('hidden');
            
            if(this.checkMark) this.checkMark.innerText = '';
            
            if(!this.activeModal) {
                this.modalAdd.classList.remove('hidden');
            } else {
                this.activeModal.classList.add('hidden');
                this.modalAdd.classList.remove('hidden');
            }
            this.closePreviousFullDesc();
            this.activeModal = this.modalAdd;
         
            this.addForm.elements.descAdd.focus();
        });
    }

    openEditModal(el) {
        const editButton = el.getElementsByClassName('ticket__edit').item(0);
        editButton.addEventListener('click', (e) => {
            this.background.classList.toggle('hidden');

            if(!this.activeModal) {
                this.modalEdit.classList.remove('hidden'); 
            } else {
                this.activeModal.classList.add('hidden');
                this.modalEdit.classList.remove('hidden'); 
            }
            
            //если подробное описание есть - заливаем его input-full, 
            //если нет - делаем запрос на сервер, ответ заливаем в input-full и fullDesc
            const fullDesc = el.getElementsByClassName('tickets__full-description').item(0);
            if(!fullDesc.innerText) {
                this.xhr.sendFullDescRequest(el.dataset.id).then(response => {
                    response = JSON.parse(response);
                    fullDesc.innerText = response;
                    this.editForm.elements.full.value = response;
                });
            } else {
                this.editForm.elements.full.value = fullDesc.innerText;
            }
            
            this.editForm.elements.descEdit.focus();
            const parent = e.target.closest('.tickets__item');
            const ticketDesc = parent.getElementsByClassName('ticket__desc').item(0).innerText
            this.editForm.elements.descEdit.value = ticketDesc;
            this.closePreviousFullDesc(parent.dataset.id);
            
            this.activeTicket = el;
            this.activeModal = this.modalEdit;
            this.getCheckMark(el);
        });
    }

    openDeleteModal(el) {
        const deleteButton = el.getElementsByClassName('ticket__delete').item(0);
        deleteButton.addEventListener('click', () => {
            this.background.classList.toggle('hidden');

            if(!this.activeModal) {
                this.modalDelete.classList.remove('hidden');
            } else {
                this.activeModal.classList.add('hidden'); 
                this.modalDelete.classList.remove('hidden');
            }
            
            console.log(this.modalDelete);
            this.deleteButton.focus();
            this.closePreviousFullDesc();
            this.activeModal = this.modalDelete;
            this.activeTicket = el;
            this.getCheckMark(el);
        });
    }

    openFullDescription(el) {
        const clickAreal = el.getElementsByClassName('click-areal').item(0);
        clickAreal.addEventListener('click', (e) => {
            const fullDesc = el.getElementsByClassName('tickets__full-description').item(0);
            fullDesc.classList.toggle('hidden');
            const curentTicket = e.target.closest('.tickets__item');
            
            // если подробно описание есть, повторный запрос не отправляем
            if(!fullDesc.innerText) {
                this.xhr.sendFullDescRequest(curentTicket.dataset.id).then(response => {
                    fullDesc.innerText = JSON.parse(response);
                });
            }

            this.closePreviousFullDesc(curentTicket.dataset.id);
            this.activeTicket = curentTicket;
            this.getCheckMark(el);
        });
    }
    
    closePreviousFullDesc(curentTicketID = null) {
        if(this.activeTicket && this.activeTicket.dataset.id != curentTicketID) {
            const lastTicketFullDesc = this.activeTicket.getElementsByClassName('tickets__full-description').item(0);
            lastTicketFullDesc.classList.add('hidden');
        }
    }

    addTicket() {
        this.addForm.addEventListener('submit', (e) => {
            e.preventDefault();
          
            if(!this.addForm.elements.descAdd.value) {
                this.modalAddError.innerText = 'Добавьте краткое описание тикета';
                this.addForm.elements.descAdd.focus();
            } else {
                this.background.classList.toggle('hidden');
                this.modalAddError.innerText = '';
                
                const formData = new FormData(this.addForm);
                formData.append('created', this.xhr.getDate());
                const date = this.xhr.getDate();
                const descValue = formData.get('description');
                
                this.xhr.sendCreateRequest(formData).then(ticketId => {
                    this.createTicket(descValue, date, ticketId);
                    this.clearFormValue();
                });

                this.modalAdd.classList.add('hidden'); 
            }
        });
    }
    
    editTicket() {
        this.editForm.addEventListener('submit', (e) => {
            e.preventDefault();
           
            if(!this.editForm.elements.descEdit.value) {
                this.modalEditError.innerText = 'Добавьте краткое описание тикета';
                this.editForm.elements.descEdit.focus();
            } else {
                this.background.classList.toggle('hidden');
                this.modalAddError.innerText = '';
                
                const formData = new FormData(this.editForm);
                const ticketID = this.activeTicket.dataset.id;
                this.xhr.sendEditRequest(formData, ticketID); 

                const ticketDesc = this.activeTicket.getElementsByClassName('ticket__desc').item(0);
                ticketDesc.innerText = this.editForm.elements.descEdit.value;
                const ticketFullDesc = this.activeTicket.getElementsByClassName('tickets__full-description').item(0);
                ticketFullDesc.innerText = this.editForm.elements.fullEdit.value;
                const ticketDate = this.activeTicket.getElementsByClassName('ticket__date').item(0);
                ticketDate.innerText = this.xhr.getDate();
                
                this.modalEdit.classList.add('hidden');
                this.clearFormValue();
            }
        });
    }

    deleteTicket() {
        this.deleteButton.addEventListener('click', () => {
            const ticketID = this.activeTicket.dataset.id
            this.xhr.sendDeleteRequest(ticketID)

            this.activeTicket.remove(); 
            this.modalDelete.classList.add('hidden');
            this.background.classList.toggle('hidden');
        });
    }

    cancelTicket() { 
        this.cancelButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                this.background.classList.toggle('hidden');
                if(this.checkMark) this.checkMark.innerText = '';
                const modal = e.target.closest('.modals');
                modal.classList.add('hidden');
                this.clearFormValue();
            });
        });
    }

    createTicket(descValue, date, ticketID) {
        const li = document.createElement('li');
        li.classList.add('tickets__item');
        li.setAttribute('data-id', ticketID); 
        li.insertAdjacentHTML('beforeEnd', `
            <div class="tickets__content">
                <div class="click-areal">
                    <div class="box box-left"> 
                        <div class="box">
                            <span class="ticket__choice"></span>
                            <span class="ticket__desc">${descValue}</span>
                        </div>
                        <div class="date"> 
                            <span class="ticket__date">${date}</span>
                        </div>
                    </div>
                    <p class="tickets__full-description hidden"></p>
                </div>
                <div>
                    <button class="ticket__edit">&#9998;</button>
                    <button class="ticket__delete ticket__button">&#10006;</button>
                </div>                
            </div>`
        );

        this.openEditModal(li);
        this.openDeleteModal(li);
        this.openFullDescription(li);
        this.tiketsBox.append(li);
    }
}



    
