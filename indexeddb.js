function generateInput()
{
    
    var wrap = document.getElementById("wrapper");
    var input = document.createElement("input");
    input.setAttribute("id", "generatedText");
    wrap.append(input);
        
};

function deleteInput()
{
    if (document.getElementById("generatedText"))
    {
        var wrap = document.getElementById("wrapper");
        wrap.removeChild(document.getElementById("generatedText"))
    }
    
}

/* Database Stuff */
if (!window.indexedDB)
{
    console.log("IndexedDB could not be initialized");
};

/*Initial answers to be added to aanswer table */
const initial_answers = [
    {answer: "Maybe"},
    {answer: "Could be"},
    {answer: "Definitely not"},
    {answer: "If the weather is good "},
    {answer: "Depends on the phase of the moon"},
    {answer: "Why do you ask?"},
    {answer: "Go ask someone else"},
    {answer: "I couldn't possibly fail to disagree less"}
  ];

// Relation  & actualRelation are the IDBObject instance 
//myDBName & actualDBName are the names of the table
const relation = "answers";
var myDBName = 'answerTable';
var actualRelation = "questions _and_answers";
var actualDBName = "questions_and_answers_table";
var database;
var ctx;

/* Initializes answer database and adds answers to it */
function initDB()
{
    /*Request to open to database*/
    var request = window.indexedDB.open(myDBName, 3);

    request.onerror = function(event)
    {
      console.log("Error opening database");
    };

    request.onsuccess = function(event)
    {
        database = event.target.result;

    }

    request.onupgradeneeded = function(event)
    {
        console.log("Updating");

        
        //Saves the IDBDatabase interface
        var database = event.target.result;
        /*Creates object store
          Makes Primary key for the table - key
          Autoincrement : true - means keys are automatically generated
          Creates field: answer , unique: false means that values in that field can be repeated
          Also, adding answers to database here, so it only adds it once */
        var table = database.createObjectStore(relation, {keyPath :"key" , autoIncrement : true});

        table.createIndex("answer", "answer", {unique: false});
        setTimeout(() =>{addAllAnswers(relation, initial_answers);}, 2000);


        
    };

    /*Adds initial answers to answer table */
    function addAllAnswers (relation, initial_answer)
    {
        /*Create a transaction to read & write into specified object store */
        var relationTrans = database.transaction(relation, "readwrite").objectStore(relation);

        /*Adds every element in the JSON array to database */
        initial_answer.forEach(function(answer)
        {
            relationTrans.add(answer);
        });
        console.log("Added");

        relationTrans.getAll().onsuccess = function (event)
        {
         console.log (event.target.result);
        };
    
    };
    
};

/*IDBObject instance for storing both question and answers*/
function runningTable()
{
    var req = window.indexedDB.open(actualDBName, 3);

    req.onerror = function(event)
    {
      console.log("Error opening database");
    };

    req.onsuccess = function(event)
    {
        database = event.target.result;
        console.log("Created other table");
        setTimeout(() =>{main();}, 1000);
    }

    req.onupgradeneeded = function(event)
    {
        console.log("Updating");

        
        //Saves the IDBDatabase interface
        var database= event.target.result;
        var table = database.createObjectStore(actualRelation, {keyPath :"question" , autoIncrement : true});
        
        table.createIndex("question", "question", {unique: true});
        table.createIndex("answer", "answer", {unique: false});

        
    };
    
    /*Generates random numner to get from answer table */
     function generateAnswer()
     {
        console.log("In generateAnswer()");
        min = 1;
        max = 8;
        key_to_get = Math.random() * (max-min + 1) + min;
        key_to_get = key_to_get.toFixed(0);
        key_to_get = parseInt(key_to_get);

        getAnswer(key_to_get);
     }

     /*Adds new question answer pair to database */
     function addEntry(answer)
        {
            var questionToAdd = document.getElementById("question").value;
            var entry = {question: questionToAdd, answer: answer};
            var currequest = window.indexedDB.open(actualDBName, 3);

            currequest.onsuccess = function(event)
            {
                database = event.target.result;
                var trans = database.transaction(actualRelation, "readwrite").objectStore(actualRelation);
                var request = trans.add(entry);

                request.onsuccess = function()
                {
                    console.log ("successfully added");
                    setTimeout(() =>{document.getElementById("answer").value = "";}, 6000);


                };

                request.onerror = function()
                {
                    console.log("I couldn't add");
                }
            } 

        };

        
    /*checks if question exists */
    function checkQuestion(actualRelation, quest)
    {
       console.log("In checkQuestion()");
       
       
       
       var transaction = database.transaction(actualRelation);
       var objectStore = transaction.objectStore(actualRelation);
       var request = objectStore.get(quest);

       request.onerror = function(event)
       {
           console.log ("Error checking question"); 
       }

       request.onsuccess = function(event)
       {
           var data = event.target.result;
       
           /*question is not in database */
           if (typeof(data) === "undefined")
           {
               
                if (document.getElementById("generatedText"))
                { 
                    var answer  = document.getElementById("generatedText").value;
                    document.getElementById("answer").value = answer;
                    canvasAction();
                    addEntry(answer);
                }
                else
                {
                    generateAnswer();
                }
           }
           
           else
           {
               /*Just get previous answer and display */
               document.getElementById("answer").value = data.answer;
               canvasAction();
           }

        };   /*Provide previous answer */
        
       

    };
    function getAnswer (key_to_get)
    { 
        var currequest = window.indexedDB.open(myDBName, 3);
        
        currequest.onsuccess = function(event)
        {
           database = event.target.result;
           var transaction = database.transaction(relation, "readonly");
           var objectStore = transaction.objectStore(relation);
           var req = objectStore.get(key_to_get);

           req.onerror = function(event)
           {
               console.log("Error getting answer");  
           }
    
           req.onsuccess = function(event)
           {
               var data = event.target.result;
               document.getElementById("answer").value = data.answer;
               canvasAction();
               addEntry(data.answer);
           }
        }

      
    };


    function main()
    {
        console.log ("In main()");
        question = document.getElementById("question").value;
        
        if (question === "")
        {
            alert ("Please ask a question");
        }
        else
        {
            checkQuestion(actualRelation, question); 

        }
        
    }

};

function clearDatabase()
{
    var currequest = window.indexedDB.open(actualDBName, 3);
        
    currequest.onsuccess = function(event)
    {
        database = event.target.result;
        var transaction = database.transaction(actualRelation, "readwrite");
        var objectStore = transaction.objectStore(actualRelation);
        var request = objectStore.clear();

        request.onsuccess = function()
        {
            console.log("cleared");
        }
    }
    
};

function canvasAction()
{
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    ctx.save();
    ctx.font ="20px Arial";
    ctx.fillStyle = getRandomColor();
    ctx.textAlign = "center";
    ctx.fillText("Surprise !", canvas.width/2, canvas.height/2);

    ctx.beginPath();
    //arc(x,y,r,sAngle,eAngle,counterclockwise);
    ctx.arc(100, 75, 20, 0, Math.PI * 2, true); 
    // Outer circle
    ctx.moveTo(110, 75);
    ctx.arc(100, 75, 10, 0, Math.PI, false); // Mouth (clockwise)
    ctx.moveTo(94, 68);
    ctx.arc(91, 68, 2, 0, Math.PI * 2, true); // Left eye
    ctx.moveTo(111, 68);
    ctx.arc(108, 68, 2, 0, Math.PI * 2, true); // Right eye
    ctx.stroke();
    canvas.style.borderColor = getRandomColor() ;

    function getRandomColor() 
    {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
        
    

};   

function Refresh()
{

    window.location.reload(false);
           
};


/*Things to work on - Canvas Animation */

