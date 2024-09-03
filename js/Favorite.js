import { GithubUser } from "./GithubUser.js";

export class Favorites {
    constructor(root){
        this.root = document.querySelector(root);
        this.load();
    }

    load(){
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
    }

    save(){
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
    }

    async add(username){
        try{
            const userExists = this.entries.find(entry => entry.login === username);

            if(userExists){
                throw new Error('Usuário já cadastrado');
            }

            const user = await GithubUser.search(username);

            if(user.login === undefined){
                throw new Error('Usuário não encontrado!');
            }

            // Spread Operator
            this.entries = [user, ...this.entries];
            this.update();
            this.save();

        } catch(error) {
            alert(error.message);
        }
    }

    delete(user){
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login);
        this.entries = filteredEntries;
        this.update();
        this.save();
    }
}

export class FavoritesView extends Favorites {
    constructor(root){
        super(root);
        this.tbody = this.root.querySelector("table tbody");
        this.update();
        this.onAdd();
    }

    onAdd(){
        const addButton = this.root.querySelector('.add button');
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.add input');
            
            this.add(value);
        };
    }

    update(){
        this.removeAllTr();
        if(this.entries && this.entries.length){
            this.entries.forEach(user => {
                const row = this.createRoll(user);
    
                row.querySelector(".remove").onclick = () => {
                    const isOk = confirm("Tem certeza que deseja deletar essa linha?");
    
                    if(isOk){
                        this.delete(user);
                    }
                };
    
                this.tbody.append(row);
            });
        }
        else{
            const emptyTable = this.createEmptyTable();
            this.tbody.append(emptyTable);
        }
    }

    removeAllTr(){
        this.tbody.querySelectorAll("tr").forEach((tr) => {
            tr.remove();
        });
    }

    createRoll(user){
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <a href="https://github.com/${user.login}" target="_blank">
                    <img src="https://github.com/${user.login}.png" alt="Image de ${user.login}">
                    <div class="profile">
                        <p class="name">${user.name}</p>
                        <p class="username">/${user.login}</p>
                    </div>
                </a>
            </td>
            <td>${user.public_repos}</td>
            <td>${user.followers}</td>
            <td>
                <button class="remove">Remover</button>
            </td>
        `;

        return tr;
    }

    createEmptyTable(){
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td class="empty-columns" colspan="4">
                <div class="empty">
                    <img src="./assets/big-star.svg" alt="Imagem de uma estrela espantada">
                    <p>Nenhum favorito ainda</p>
                </div>
            </td>
        `;

        return tr;
    }
}