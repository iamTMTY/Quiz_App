import { ScorePage } from "./quiz.js";

export class Leaderboard {

    static #database = firebase.database()
    static #rootRef = this.#database.ref('leaderboard')

    // shows the leaderboard page
    static showLeaderboard() {
    
        const leaderboardPage = document.querySelector('#leaderboard')

        leaderboardPage.className = 'show_leaderboard'
        history.pushState(null, null, '/#/leaderboard')

    }

    // takes an object of playerDetails and compares it to those on the database
    static checkLeaderboard(playerDetails) {
        let arr = this.getDatabase(); 
        

        arr.push(playerDetails);
        arr.sort((playerA, playerB) => 
        playerA.score === playerB.score?playerA.time - playerB.time:playerB.score - playerA.score)

        if(arr[10].position === "") {
            ScorePage.showScore(playerDetails, false)// player didnt make leaderboard(show score)
        } else {
            ScorePage.showScore(playerDetails, true)//player made leaderboard(show score)
        }

        arr.pop()
        this.updateDatabase(arr)
    }

    // takes an array of players and puts them in the database
    static updateDatabase(arr) {
        arr.forEach((player, index) => {
            player.position = index + 1;
            this.#database.ref(`leaderboard/${index}`).set(player)
        })
    }

    // returns an array of the current players in the database
    static getDatabase() {
        const arr = []
        this.#rootRef.once('value', snapshot => {
            snapshot.val().forEach(player => arr.push(player))
        })
        return arr
    }


    // sets initial state of the leaderboard
    static initializeLeaderboard() {
        const positions = document.querySelectorAll('.position');

        this.#rootRef.orderByKey().once('value', (snapshot) =>{
            document.querySelector('.loading-text').remove()
            document.querySelector('.loading-image').remove()

            snapshot.val().forEach(function(player, index) {
                positions[index].innerHTML = `
                    <td>${index + 1}</td>
                    <td>${player.name}</td>
                    <td>${player.category}</td>
                    <td>${player.time} secs</td>
                    <td>${player.score}</td>`
            })
            Leaderboard.updateLeaderboard()
        })
    }

    // responsible for listening to any change(s) in the database and updating the leaderboard
    static updateLeaderboard() {
        
        const positions = document.querySelectorAll('.position');

        this.#rootRef.orderByKey().on('value', (snapshot) => {

            snapshot.val().forEach(function(player, index) {
                positions[index].innerHTML = `
                    <td>${index + 1}</td>
                    <td>${player.name}</td>
                    <td>${player.category}</td>
                    <td>${player.time} secs</td>
                    <td>${player.score}</td>`
            })
        })
   }
}