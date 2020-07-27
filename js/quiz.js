import { Leaderboard } from "./leaderboard.js";
import { quiz, Validate } from "./main.js";


export class Quiz {
    #quizPage = document.querySelector('#quiz');
    #questionIndex = -1; // keeps track of current question number
    #questionInterval; // stores a reference to the timeout before next question is called
    #questions; // stores question
    #timerInterval; // stores a reference to the timeout that runs the function that counts time elapsed in each question
    #timer; // stores players time for each question
    
    constructor(playerDetails) {
        this.playerDetails = playerDetails
    }

    // sets initial state of the quiz page
    startQuiz() {

        document.querySelector('#quiz').innerHTML =`
        <div class="quiz-play">
            <p class="count">Question: </p>
            <div class="question_container">
                    <img style="margin: auto;" src="./images/712.gif" alt="loading..." width="32px" height="32px"">                
            </div>
        </div>`

        if(document.location.hash !== "#/quiz") {

            this.#quizPage.className = 'show_quiz'
            history.pushState(null, null, '/#/quiz')

        }

        this.requestQuestions()
    }
 
    // makes a request to get token from api(token helps prevent repetition of questions over a certain period)\
    //stores token in localStorage
    // makes a call to an api to request questions with token and player"s selected category
    // stores data recieved in a variable(#questions)
    requestQuestions() {

        let token;

        if (localStorage.getItem('token') === null) {
            fetch("https://opentdb.com/api_token.php?command=request")
                .then(res => res.json())
                .then(data => {
                    token = data.token
                    localStorage.setItem('token', JSON.stringify(token))
                    fetch(`https://opentdb.com/api.php?amount=10&token=${token}&category=${this.playerDetails.categoryID}&type=multiple`)
                        .then(res => res.json())
                        .then(data => {
                            this.#questions = data
                            this.create()
                        })
                })
        } else {
            token = JSON.parse(localStorage.getItem('token'))
    
            fetch(`https://opentdb.com/api.php?amount=10&token=${token}&category=${this.playerDetails.categoryID}&type=multiple`)
                .then(res => res.json())
                .then(data => {
                    if (data.response_code === 0) {
                        
                        this.#questions = data
                        this.create()
                        
                    } else {
                        localStorage.clear();
                        this.requestQuestions()
                    }
                })
        }
    }

    // this method (with the help of other helper methods and properties) makes 1 question
    // this method continues to loop until player has answered up to 10 questions
    create() {
        this.#questionIndex++
        console.log(quiz.#timer);

        //implementation of option shuffling
        const shuffledOptions = this.shuffle([this.#questions.results[this.#questionIndex].correct_answer,
        ...this.#questions.results[this.#questionIndex].incorrect_answers]);
        
        this.constructQuestion(shuffledOptions)

        this.questionCounter()

        this.optionEvent()

        this.#timer = -2
        this.scoreTimer()

        // loads up next question after 20seconds
        if (this.#questionIndex === 9) {
            this.#questionInterval = setTimeout(() => {
                this.playerDetails.time += 20
                clearInterval(this.#timerInterval)
                document.querySelector('.question_container').innerHTML = `<p>Computing Score...</p>`;
                Leaderboard.checkLeaderboard(this.playerDetails)
            }, 22000)
        } else {

                this.#questionInterval = setTimeout(() => {
                this.playerDetails.time += 20
                clearInterval(this.#timerInterval)
                this.create();
            }, 22000)
        }
    }

    // outputs the questions and options into the DOM
    constructQuestion(shuffledOptions) {

        const questionContainer = document.querySelector('.question_container');

        questionContainer.innerHTML =`
            <p class="question">${this.#questions.results[this.#questionIndex].question}</p>
            <div class="options">
                <p class="option one">${shuffledOptions[0]}</p>
                <p class="option two">${shuffledOptions[1]}</p>
                <p class="option three">${shuffledOptions[2]}</p>
                <p class="option four">${shuffledOptions[3]}</p>
            </div>
            <div class="timer-container">
                <div class="timer"></div>
            </div>`

    }

    // add event listener to the options
    optionEvent() {
        const options = document.querySelectorAll('.option')

        options.forEach(function(option) {
            option.addEventListener('click', validateChoice)
        })

        // validateChoice does several things
        function validateChoice() {
            clearInterval(quiz.#questionInterval)
            clearInterval(quiz.#timerInterval)
    
            quiz.playerDetails.time += quiz.#timer
    
            if (this.innerText === quiz.#questions.results[quiz.#questionIndex].correct_answer) {
                this.style.background = "#7ef865"
                quiz.playerDetails.score += 10
            } else {
                this.style.background = "#f86565"
                document.querySelectorAll(".option").forEach(function (option) {
                    if (option.innerText === quiz.#questions.results[quiz.#questionIndex].correct_answer) {
                        option.style.background = "#7ef865"
                    }
                })
            }
        
            if (quiz.#questionIndex === 9) {
                // clearInterval(questionInterval)
                setTimeout(() => {
                    document.querySelector('.question_container').innerHTML = `<p>Computing Score...</p>`;
                    Leaderboard.checkLeaderboard(quiz.playerDetails)
                }, 1000)     
            } else {
                setTimeout(() => quiz.create(quiz.#questions), 1000);
            }
        
            document.querySelectorAll(".option").forEach(function (option) {
                option.removeEventListener('click', validateChoice)
            })
        }
    }

    // outputs the current question count into the DOM
    questionCounter() {
        document.querySelector('.count').innerText = `Question : ${this.#questionIndex + 1}/10`
    }

    // shuffles the options array and returns it(so the answer is not always in just one option)
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    
        return array
    }

    // increments the timer variable by 1 after every call
    scoreTimer() {
        this.#timer++
        this.#timerInterval = setTimeout(() => this.scoreTimer(), 1000)
    
    }    
}

export class ScorePage{

    static quizPage = document.querySelector('#quiz');


    static showScore(playerDetails, leaderboard) {
        let remark = `you didn't make the leaderboard ${playerDetails.name}, better luck next time.`;
      
        if(leaderboard) {
            remark = `Nice job ${playerDetails.name}, you made it to the leaderboard!`
        }

        this.quizPage.innerHTML += `
        <div class="quiz-score">
            <p>You scored</p>
            <p class="player-score">${playerDetails.score}<span>pts</span></p>
            <p class="remark">${remark}</p>

            <label>share on</label>
            <div class="social-links">
                <a href="https://api.whatsapp.com/send?text=Hey,%20Can%20you%20beat%20my%20score%20of%20${playerDetails.score}%20in%20the%20${playerDetails.category}%20category%20on%20quizzer%20.%20Take%20quiz%20here:%20https://quizzer-pro.netlify.app" target="_blank">
                    <img src="./images/whatsapp.svg">
                </a>
                <a href="https://twitter.com/share?text=Hey,Can you beat my score of ${playerDetails.score} in the ${playerDetails.category} category on Quizzer.Take quiz here: &url=https://quizzer-pro.netlify.app&hashtags=quiz,${playerDetails.category},quizzer" target="_blank">
                    <img src="./images/twitter.svg">
                </a>
            </div>

            <div class="quiz-score-buttons">
                <button class="go_home">Home</button>              
                <button class="play_again">Play again</button>
                <button class="go_leaderboard">Leaderboard</button>

            </div>`

            this.homeButtonEvent()
            this.playAgainButtonEvent(playerDetails)
            this.leaderboardButtonEvent()
    }

    static homeButtonEvent() {
        document.querySelector('.go_home').addEventListener('click', () => {
            this.quizPage.className = 'remove_quiz'
        })
    }

    static playAgainButtonEvent(playerDetails) {

        document.querySelector('.play_again').addEventListener('click', () =>{
            const newPlayerDetails = {
                name: playerDetails.name,
                category: playerDetails.category,
                categoryID: playerDetails.categoryID,
                score: 0,
                time: 0,
                position: ""
            }

            Validate.prepareQuiz(newPlayerDetails);
        })
    }

    static leaderboardButtonEvent() {
        document.querySelector('.go_leaderboard').addEventListener('click', () => {
            this.quizPage.className = 'remove_quiz'
            Leaderboard.showLeaderboard()
        })
    }
} 
