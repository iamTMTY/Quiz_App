import { Quiz } from "./quiz.js";
import { Leaderboard } from "./leaderboard.js";
export let quiz;
export let homepage;


class Presets {

    playerDetails = {
        name: "",
        category: "",
        categoryID: "",
        score: 0,
        time: 0,
        position: ""        
    }

    popstateEvent() {
        window.addEventListener('popstate', function() {
            const quizPage = document.querySelector('#quiz');
            const leaderboardPage = document.querySelector('#leaderboard');
            
            quizPage.className = '';
            leaderboardPage.className = '';
            const location = document.location.hash;

            switch (location) {
                case "":
                    quizPage.style.left = '100vw';
                    leaderboardPage.style.left = '-100vw';
                    break;
                case "#/quiz":
                    quizPage.style.left = '0';
                    leaderboardPage.style.left = '-100vw';
                    break;
                case "#/leaderboard":
                    quizPage.style.left = '100vw';
                    leaderboardPage.style.left = '0vw';
                    break;
                default:
                    break;
            }
    
        })
    }

    categoryButtonEvent() {
        const categoryButtons = document.querySelectorAll('.category');

        categoryButtons.forEach((button) => {
            button.addEventListener('click', () => {
                categoryButtons.forEach(button => {
                    button.style.backgroundColor = 'white'
                    button.style.color = 'purple'
                })
                button.style.backgroundColor = 'purple'
                button.style.color = 'white' 
                this.playerDetails.categoryID = button.value;
                this.playerDetails.category = button.name;
            })
        })
    }

    startButtonEvent() {
        const inputField = document.querySelector('.input-field');
        const start = document.querySelector('.start');
        
        start.addEventListener('click', () => {
            this.playerDetails.name = inputField.value
            Validate.validatePlayer(this.playerDetails);
        })
    }

    leaderboardButtonEvent() {
        const leaderboardBtn = document.querySelector('.top_quizzers');

        leaderboardBtn.addEventListener('click', () => Leaderboard.showLeaderboard())        
    }

    homeButtonEvent() {
        const homeButton = document.querySelector('.home_btn');
        const leaderboardPage = document.querySelector('#leaderboard');

        homeButton.addEventListener('click', () => {
            leaderboardPage.className = 'remove_leaderboard'
            history.pushState(null, null, '/#')
        })
    }
}

export class Validate {

    static validatePlayer(playerDetails) {
        const name = playerDetails.name
        const ID = playerDetails.categoryID

        const userCheck = /^[a-z]([0-9][0-9]+|[a-z]+\d*)$/i;
        const result = userCheck.test(name);

        if(!result || ID === "") {
            if(ID === "") {
                document.querySelector('.name-error').style.visibility = 'hidden'
                document.querySelector('.category-error').style.visibility = 'visible'
                // categoryButtons.focus()
            }
            if(!result) {
                if(ID !== "") { document.querySelector('.category-error').style.visibility = 'hidden' }
                document.querySelector('.input-field').focus()
                document.querySelector('.name-error').style.visibility = 'visible'
            }
        } else {

            this.prepareQuiz(playerDetails)

            homepage.playerDetails = {
                name: "",
                category: "",
                categoryID: "",
                score: 0,
                time: 0,
                position: ""
            }

            document.querySelectorAll('.category').forEach(function(button) {
                button.style.backgroundColor = 'white'
                button.style.color = 'purple'
            });

        }
    }

    static prepareQuiz(playerDetails) {
        
        quiz = new Quiz(playerDetails)
        quiz.startQuiz()
        
    }
}


document.addEventListener('DOMContentLoaded', () => {
    history.replaceState(null, null, '/#')
    homepage = new Presets()
    homepage.popstateEvent()
    homepage.categoryButtonEvent()
    homepage.startButtonEvent()
    homepage.leaderboardButtonEvent()
    homepage.homeButtonEvent() 
    Leaderboard.initializeLeaderboard()
})

