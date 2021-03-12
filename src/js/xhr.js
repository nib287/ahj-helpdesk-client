export default class XHR {
    constructor() {
        this.ticketID = null;
    }

    getAllTickets() {
        return new Promise((resolve, reject) => {   
            const xhr = new XMLHttpRequest();   
            xhr.open('GET', 'https://git.heroku.com/ahj-heildesk-server.git/?method=allTickets');
            
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response); 
                } else {
                    reject('Network Error');
                }
            });

            xhr.send();  
        });                 
    }
    
    sendFullDescRequest(ticketID) {
        return new Promise((resolve, reject) => {   
            const xhr = new XMLHttpRequest();   
            const queryString = `method=fullDescTicket&id=${ticketID}`;
            xhr.open('GET', `https://ahj-helpdesk.herokuapp.com/?${queryString}`);
            
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response); 
                } else {
                    reject('Network Error');
                }
            });

            xhr.send();  
        });           
    }
    
    sendCreateRequest(formData) {
        return new Promise((resolve, reject) => {   
            formData.append('method', 'createTicket');
            formData.append('id', null);
            formData.append('status', true);

            const xhr = new XMLHttpRequest();   
            xhr.open('POST', 'https://ahj-helpdesk.herokuapp.com/');
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response); 
                } else {
                    reject('Network Error');
                }
            });

            xhr.send(formData);  
        });           
    }

    sendEditRequest(formData, ticketID) {
        formData.append('method', 'editTicket');
        formData.append('id', ticketID);
        formData.append('created', this.getDate());
        
        const xhr = new XMLHttpRequest();   
        xhr.open('POST', 'https://ahj-helpdesk.herokuapp.com/');
        xhr.send(formData);         
    }
    
    sendDeleteRequest(ticketID) {
        const data = new FormData();
        data.append('method', 'deleteTicket');
        data.append('id', ticketID);
        
        const xhr = new XMLHttpRequest();   
        xhr.open('POST', 'https://ahj-helpdesk.herokuapp.com/');
        xhr.send(data);  
    }

    getDate() {
        const options = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            timezone: 'UTC',
            hour: 'numeric',
            minute: 'numeric',
        };
        
        return  new Date().toLocaleString("ru", options);
    }
}
