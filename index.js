/* global $ */
'use strict';

/******************************************************** 
 Main arrays
********************************************************/

let QUESTIONS = [];  // Nothing to see here until the data is fetched from the Open Trivia Database (https://opentdb.com/)

/******************************************************** 
 json data packet variables 
********************************************************/

const JSON = {  // All the variables connected to the json packet go here.
  endpoint: 'https://opentdb.com/',
  apiKey: '',
  amount: 2,
  category: 9,
  difficulty: 'medium',
  type: ''
};

/******************************************************** 
 All global variables here. 
********************************************************/

const STORE = {  // All the variables connected with the state of the DOM go here.
  currentQuestion: 0,
  currentView: 'splash',
  currentScore: 0,
  radioButtonClicked: false
};

/******************************************************** 
Step 1: Render the DOM. 
********************************************************/

const GetAPIPacket = {  // Gets questions data from the Open Trivia Database (https://opentdb.com/).
  getJsonKey: function(){
    console.log('In the getKey method');
    $.getJSON(`${JSON.endpoint}api_token.php?command=request`, function(json){
      //console.log(json.token);
      if(json.token!==''){
        JSON.apiKey=json.token;
      }
    });
    this.getJsonQuestions();
  },

  getJsonQuestions: function(){
    console.log('In the getJsonQuestions method');
    let rndAnsArr=[];
    let tempObj={
      amount: JSON.amount===0  ? 'amount=10' : `amount=${JSON.amount}`,
      category: JSON.category===0  ? '' : `&category=${JSON.category}`,
      difficulty: JSON.difficulty===0  ? '' : `&difficulty=${JSON.difficulty}`,
      type: JSON.type===0  ? '' : `&type=${JSON.type}`,
      token: JSON.apiKey==='' ? '' : `&token=${JSON.apiKey}`
    };
    $.getJSON(`${JSON.endpoint}api.php?${tempObj.amount}${tempObj.category}${tempObj.difficulty}${tempObj.type}${tempObj.token}`, function(json){
      console.log('In the json callback function');
      let tempArr=[];
      for(let i=0; i<JSON.amount; i++){
        if(json.results[i].type==='multiple'){
          QUESTIONS.push({
            question: json.results[i].question,
            answer1: json.results[i].correct_answer,
            answer2: json.results[i].incorrect_answers[0],
            answer3: json.results[i].incorrect_answers[1],
            answer4: json.results[i].incorrect_answers[2],
            correct: 0,
            userChoice: 0,
            choiceCount: 4,
          });
        } else {
          QUESTIONS.push({
            question: json.results[i].question,
            answer1: json.results[i].correct_answer,
            answer2: json.results[i].incorrect_answers[0],
            answer3: '',
            answer4: '',
            correct: 0,
            userChoice: 0,
            choiceCount: 2,
          });            
        }
      }
      scrambleChoices.doScrambling();
    });
  }
};

const scrambleChoices = {  // First answer is always right. Scramble the choices so that's not so.
  doScrambling: function(){
    console.log('In the doScrambling method');
    for(let i=0; i<QUESTIONS.length; i++){
      let rightChoice=QUESTIONS[i].answer1;
      let wrongChoices=[];
      wrongChoices.push('');
      wrongChoices.push(QUESTIONS[i].answer2);
      if(QUESTIONS[i].choiceCount===4){
        wrongChoices.push(QUESTIONS[i].answer3);
        wrongChoices.push(QUESTIONS[i].answer4);      
      }
      let seqArr=[];
      if(QUESTIONS[i].choiceCount===4){
        seqArr=[1,2,3,4];     
      } else {
        seqArr=[1,2];
      }
      let rndPos=0;
      let rndArr=[];
      for(let j=QUESTIONS[i].choiceCount; j>1; j--){
        rndPos=this.pickNum(1,j);
        rndArr.push(seqArr.splice(rndPos-1,1));
      }
      rndArr.push(seqArr.splice(0,1));
      // rndArr.push(seqArr[0]);
      let newAnswers=[];
      let pos=0;
      for(let j=0; j<QUESTIONS[i].choiceCount; j++){
        pos = rndArr[j];
        newAnswers.push(wrongChoices[pos-1]);   
      }
      for(let j=1; j<=QUESTIONS[i].choiceCount; j++){
        QUESTIONS[i]['answer'+j]=newAnswers[j-1];
        if(QUESTIONS[i]['answer'+j]===''){
          QUESTIONS[i]['answer'+j]=rightChoice;
          QUESTIONS[i].correct=j;
        }
      }
    }
  },

  pickNum: function(min, max){
    console.log('In the pickNum method');
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

const RenderPage = {  // Determines what HTML to display based on the current state.
  doShowPages: function(){
    if (STORE.currentQuestion===0 && STORE.currentView==='splash'){
      this.splashPage();
    }
    if (STORE.currentQuestion===0 && STORE.currentView==='options'){
      this.optionsPage();
    }
    if (STORE.currentQuestion>=1 && STORE.currentQuestion<=QUESTIONS.length && STORE.currentView==='question'){
      this.questionsPage();
    }
    if (STORE.currentQuestion>=1 && STORE.currentQuestion<=QUESTIONS.length && STORE.currentView==='feedback'){
      this.feedBackPage();
    }
    if(STORE.currentQuestion === QUESTIONS.length && STORE.currentView === 'wrap'){
      this.wrapPage();
    }
  },

  splashPage: function(){
    console.log('In the splashPage method.');
    $('#js-userButton').html('START');
    $('div.js-pageViewSplashHTML').show();
    $('div.js-pageViewOptionsHTML').hide();
    $('div.js-pageViewQuestionHTML').hide();
    $('div.js-pageViewFeedBackHTML').hide();
    $('div.js-pageViewWrapHTML').hide();
  },

  optionsPage: function(){
    console.log('In the optionsPage method.');
    $('#js-userButton').html('ONWARD!');
    $('div.js-pageViewSplashHTML').hide();
    $('div.js-pageViewOptionsHTML').show();
    $('div.js-pageViewQuestionHTML').hide();
    $('div.js-pageViewFeedBackHTML').hide();
    $('div.js-pageViewWrapHTML').hide();
  },

  questionsPage: function(){
    console.log('In the questionsPage method.');
    $('#js-userButton').html('ENTER');
    $('.js-currentScore').html(STORE.currentScore);
    $('.js-currentQuestion').html(STORE.currentQuestion);
    $('.js-totalQuestions').html(JSON.amount);
    this.renderQuestions();
    if(QUESTIONS[STORE.currentQuestion-1].answer3===''){  // true-false question
      $('.js-twoMore').hide();
    } else {
      $('.js-twoMore').show();
    }
    $('div.js-pageViewSplashHTML').hide();
    $('div.js-pageViewOptionsHTML').hide();
    $('div.js-pageViewQuestionHTML').show();
    $('div.js-pageViewFeedBackHTML').hide();
    $('div.js-pageViewWrapHTML').hide();
  },

  feedBackPage: function(){
    console.log('In the feedbackPage method.');
    $('#js-userButton').html('CONTINUE');
    $('.js-feedbackQuestion').html(QUESTIONS[STORE.currentQuestion-1].question);
    $('.js-correctAnswer').html('THE ANSWER IS:<br/>'+QUESTIONS[STORE.currentQuestion-1]['answer'+QUESTIONS[STORE.currentQuestion-1].correct]);
    $('.js-userAnswer').html('YOUR ANSWER:<br/>'+QUESTIONS[STORE.currentQuestion-1]['answer'+QUESTIONS[STORE.currentQuestion-1].userChoice]);
    if(QUESTIONS[STORE.currentQuestion-1].userChoice+'' === QUESTIONS[STORE.currentQuestion-1].correct+''){
      STORE.currentScore++;
      $('.js-feedBackImageRight').show();
      $('.js-feedBackImageWrong').hide();
      $('.js-userAnswer').hide();
    } else {
      $('.js-feedBackImageRight').hide();
      $('.js-feedBackImageWrong').show();
      $('.js-userAnswer').show();     
    }
    $('.js-currentScore').html(STORE.currentScore);
    $('.js-totalQuestions').html(JSON.amount);
    $('.js-currentQuestion').html(STORE.currentQuestion);
    $('div.js-pageViewSplashHTML').hide();
    $('div.js-pageViewOptionsHTML').hide();
    $('div.js-pageViewQuestionHTML').hide();
    $('div.js-pageViewFeedBackHTML').show();
    $('div.js-pageViewWrapHTML').hide();
  },

  wrapPage: function(){
    console.log('In the wrapPage method.');
    let listHTML='';
    for(let i=0; i<QUESTIONS.length; i++) {
      if(QUESTIONS[i].correct+''===QUESTIONS[i].userChoice+''){
        listHTML+=`<li>${QUESTIONS[i].question}<br/>Answer: ${QUESTIONS[i]['answer'+QUESTIONS[i].correct]}<br/>Yours: <span class='js-correct'>${QUESTIONS[i]['answer'+QUESTIONS[i].userChoice]}  ✔</span></li>`;
      } else {
        listHTML+=`<li>${QUESTIONS[i].question}<br/>Answer: ${QUESTIONS[i]['answer'+QUESTIONS[i].correct]}<br/>Yours: <span class='js-incorrect'>${QUESTIONS[i]['answer'+QUESTIONS[i].userChoice]}  X</span></li>`;
      }
    }
    $('#js-userButton').html('PLAY AGAIN?');
    $('.js-currentScore').html(STORE.currentScore);
    $('.js-totalQuestions').html(JSON.amount);
    $('.js-currentQuestion').html(STORE.currentQuestion);
    $('.js-scorePercent').html((STORE.currentScore/STORE.currentQuestion)*100 + '%');
    $('.js-evalList').html(listHTML);
    $('div.js-pageViewSplashHTML').hide();
    $('div.js-pageViewOptionsHTML').hide();
    $('div.js-pageViewQuestionHTML').hide();
    $('div.js-pageViewFeedBackHTML').hide();
    $('div.js-pageViewWrapHTML').show();
  },

  renderQuestions: function(){
    console.log('In the renderQuestions method.');
    //only if the STORE is on pages that show questions
    $('.js-screenQuestion').html(QUESTIONS[STORE.currentQuestion-1].question);
    $('#js-choice1').html(QUESTIONS[STORE.currentQuestion-1].answer1);
    $('#js-choice2').html(QUESTIONS[STORE.currentQuestion-1].answer2);
    $('#js-choice3').html(QUESTIONS[STORE.currentQuestion-1].answer3);
    $('#js-choice4').html(QUESTIONS[STORE.currentQuestion-1].answer4);
    $('div.js-pageViewQuestionHTML').show();
  }
};

const GenerateHTML = {  // Here's where the extra HTML comes from.
  doHtmlPages: function(){
    console.log('In the doHtmlPages method.');
    this.splashHtml();
    this.optionsHtml();
    this.questionHtml();
    this.feedBackHtml();
    this.wrapHtml();
  },

  splashHtml: function(){
    console.log('In the splashHtml method.');
    // Set up splash page, then hide it.

    let quizSplashHTML = `
      <div class='js-optionsPage'>
        <img src="splash.jpg" class="js-splashImage" alt="Let's get Thinkful, because it's Quiz Time! Cartoon person at 
      the beach in a thinking pose next to a huge red question mark.">
      </div>`;

    $('div.js-pageViewSplashHTML').html(quizSplashHTML);
    $('div.js-pageViewSplashHTML').hide();
  },

  optionsHtml: function(){
    console.log('In the optionsHtml method.');
    // Set up splash page, then hide it.

    let quizOptionsHTML = `
      <div class='js-optionsPage'>
        <img src="settings.jpg" class="js-settingsImage" alt="machinery and gauges">
      </div>`;

    $('div.js-pageViewOptionsHTML').html(quizOptionsHTML);
    $('div.js-pageViewOptionsHTML').hide();
  },

  questionHtml: function(){
    console.log('In the questionHtml method.');
    // Set up question page, then hide it.

    let quizQuestionsHTML = `
      <div class='js-optionsPage'>
        <img src='questions.jpg' class='js-questionsImage' alt='walking out of fog'>
      </div>
      <div class='js-scoreBox'>Score: <span class='js-currentScore'></span> of <span class='js-totalQuestions'></span></div>
      <div class='js-questionCounter'>Question: <span class='js-currentQuestion'></span> of <span class='js-totalQuestions'></span></div>
        <div class='js-screenQuestion'></div>
        <div class='js-radioButton' name='js-radioButton'>
          <input type='radio' name='choices' value=1>
          <label for='choice1' id='js-choice1'></label><br/>
          
          <input type='radio' name='choices' value=2>
          <label for='choice1' id='js-choice2'></label><br/>
          
          <div class='js-twoMore'><input type='radio' name='choices' value=3>
          <label for='choice1' id='js-choice3'></label><br/>
          
          <input type='radio' name='choices' value=4>
          <label for='choice1' id='js-choice4'></label><br/></div>
        </div>
    `;
    // NOTE: The question and the five choices will be inserted in the correct places above, in renderQuestions().
    $('div.js-pageViewQuestionHTML').html(quizQuestionsHTML);
    $('div.js-pageViewQuestionHTML').hide();
  },

  feedBackHtml: function(){
    console.log('In the feedBackHtml method.');
    // Set up feedback page, then hide it.

    let quizFeedbackHTML = `
      <div class='js-optionsPage'>
        <img src='feedback.jpg' class='js-feedbackImage' alt='mountains in the mist'>
      </div>
      <div class='js-scoreBox'>Score: <span class='js-currentScore'></span> of <span class='js-totalQuestions'></span></div>
      <div class='js-questionCounter'>Question: <span class='js-currentQuestion'></span> of <span class='js-totalQuestions'></span></div>
      <img src="Right.png" class="js-feedBackImageRight" alt="Big green check mark"></div>
      <img src="Wrong.png" class="js-feedBackImageWrong" alt="Big red X"></div>
      <div class='js-feedbackQuestion'></div><br/>
      <div class='js-correctAnswer'></div><br/>
      <div class='js-userAnswer'><br/></div>
      <br/>
      <br/>
      <br/>
    `;
    $('div.js-pageViewFeedBackHTML').html(quizFeedbackHTML);
    $('div.js-pageViewFeedBackHTML').hide();
  },

  wrapHtml: function(){
    console.log('In the wrapHtml method.');
    // Set up wrap page, then hide it.

    let quizWrapHTML = `
      <div class='js-optionsPage'>
        <img src='wrap.jpg' class='js-wrapImage' alt='sunset'>
      </div>
      <div class='js-scoreBox'>Score: <span class='js-currentScore'></span> of <span class='js-totalQuestions'></span></div>
      <div class='js-questionCounter'>Question: <span class='js-currentQuestion'></span> of <span class='js-totalQuestions'></span></div>
      <div class='js-wrapScore'>Here's how you did:
        <div class='js-scorePercent'></div>
      </div>
      <ol class='js-evalList'></ol>
      <br/>
    `;
    $('div.js-pageViewWrapHTML').html(quizWrapHTML);
    $('div.js-pageViewWrapHTML').hide();
  }
};

/******************************************************** 
 * Step 2: Listen for user interactions.
 ********************************************************/

const Listeners = {  // All listener methods. More to come here.
  listen: function(){
    console.log('In the listen method');
    this.handleUserButton();
    this.handleRadioButtonClicked();
  },

  handleUserButton: function(){
    console.log('In the handleUserButton method');
    $('#js-userButton').on('click', function() {
      $('input[name=choices]').prop('checked', false);
      if(!(STORE.currentView==='question' && STORE.radioButtonClicked===false)){
        FlipPages.nextView();
        RenderPage.doShowPages();
      }
    });
  },

  handleRadioButtonClicked: function(){
    console.log('In the handleRadioButtonClicked method');
    $('.js-radioButton').on('change',  function() {
      let selectedOption = $('input[name=choices]:checked', '.js-radioButton').val();
      if(selectedOption>0) {STORE.radioButtonClicked=true;}
      QUESTIONS[STORE.currentQuestion-1].userChoice = selectedOption;
    });
  }
};

/******************************************************** 
 * Step 3: Change the state of the STORE. 
 ********************************************************/

const FlipPages = {  // Update the DOM by changing the STORE variables on clicking the user button.
  nextView: function(){
    console.log('In the nextView method.');
    if(STORE.currentView==='splash' && STORE.currentQuestion===0){
      STORE.currentView='options';
    } else if(STORE.currentView==='options' && STORE.currentQuestion===0){
      STORE.currentView='question';
      STORE.currentQuestion=1;
    } else if(STORE.currentView==='question' && STORE.currentQuestion<=QUESTIONS.length){
      STORE.currentView='feedback';
    } else if(STORE.currentView==='feedback' && STORE.currentQuestion<QUESTIONS.length){
      STORE.currentView='question';
      STORE.radioButtonClicked = false;
      STORE.currentQuestion++;
    } else if(STORE.currentView==='feedback' && STORE.currentQuestion===QUESTIONS.length){
      STORE.currentView='wrap';
    } else if(STORE.currentView==='wrap' && STORE.currentQuestion===QUESTIONS.length){
      STORE.currentQuestion = 0;
      STORE.currentView = 'splash';
      STORE.currentScore = 0;
      STORE.radioButtonClicked = false;
      QUESTIONS = [];
      GetAPIPacket.getJsonQuestions();
    }
  }
};

/******************************************************** 
 * Step 0: Wait for page to load, then begin. Once only.
 ********************************************************/

$(()=>{  // Get the API data, add HTML, render pages, attach listeners.
  console.log('Begin the Quiz program.');
  GetAPIPacket.getJsonKey();
  GenerateHTML.doHtmlPages();
  RenderPage.doShowPages();
  Listeners.listen();
});


// Render -> User Input (Event Listener) -> State Changes (Update the STORE) -> Re-Render