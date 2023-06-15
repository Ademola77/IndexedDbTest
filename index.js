
let clearBtn = document.querySelector('#clearBtn');
let regBtn = document.querySelector('#regBtn');

let fidInput = document.querySelector('#fid');
let fnameInput = document.querySelector('#fname');
let fscoreInput = document.querySelector('#fscore');
let fgenderInput = document.querySelector('#fgender');
let ftribeInput = document.querySelector('#ftribe');
let factiveInput = document.querySelector('#factive');

let formInput = document.querySelector('form');

let updateBtn = document.querySelector('#updateBtn');
let deleteBtn = document.querySelector('#deleteBtn');
let deleteDbBtn = document.querySelector('#deleteDbBtn');


let viewByCursorBtn = document.querySelector('#viewByCursorBtn');
let ulview = document.querySelector('#ulview');



const indexedDB = window.indexedDB || window.msIndexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.shimIndexedDB;

const request = indexedDB.open('FriendsRegistry',1);

//window.onload=()=>{}

//Run,if specified database does not exist of version number is changed.
request.onupgradeneeded = (ev)=>
{
   
    const db = request.result; //Must return [object IDBDatabase]

    //Create database if it does not exist.
   const Registry_OS = db.createObjectStore("Registery",{keyPath:"Fid" /*,autoIncrement:true*/});
         Registry_OS.createIndex("TribeIndex",["Tribe"],{unique:false});
         Registry_OS.createIndex("GenderIndex",["Gender"],{unique:false});
         Registry_OS.createIndex("GenderAndTribeIndex",["Gender","Tribe"],{unique:false});

      //Below just for testing,not really necessary?  
    if (ev.newVersion >= ev.oldVersion)
        {
            console.log('olversion ' +ev.oldVersion ); //ev.oldVersion is the version number you are current existing database.
            console.log('newversion ' +ev.newVersion ); //ev.newVersion is the version number you are requesting to open.
        }
};



//Run,if the specified database is succesfully opened.
request.onsuccess = ()=>
{
    console.log('Database opening operation is succesful.');

    const db = request.result;
  
    //Run whenever submit button is click on the registration form.
    formInput.onsubmit =(ev)=>
    {
        RegisterNewFriend(ev,db);
    }

    //Clears the form of any data.
    clearBtn.addEventListener('click',()=>
    {
        ResetForm();
        regBtn.disabled=false; //Enables Registration button
    });
 
    //Run to update data.
    document.querySelector('#updateBtn').addEventListener('click',(e)=>
    {
        UpdateFriend(e,request.result);
    });

    //Run to delete data.
    deleteBtn.addEventListener('click',(e)=>
    {
        DeleteFriend(e,db) ;
    });


    //Run to delete database.
    deleteDbBtn.addEventListener('click',(e)=>
    {
        db.close(); //Close database connection
        console.log('closing database connection.');

        indexedDB.deleteDatabase('FriendsRegistry');//Deletes the database
        console.log('FriendsRegistry database deleted.');
    });



ulview.addEventListener('click',(e)=>
    {
        e.preventDefault(); //Do this to prevent e.g loss of cursor position or full refresh.
             regBtn.disabled=true; //Disable registration button
       const selectedLI= e.target.parentElement; //e.target returns the html element that is clicked,parentElement then returns the parent element that is clicked. 
       const selectedID = selectedLI.getAttribute('id'); //Gets the value of 'id' from the html element
       const trans = db.transaction(['Registery'],'readonly'); 
       const obj_OS = trans.objectStore('Registery');
       const getReq = obj_OS.get(selectedID); //NOTE: key must always be passed in as a string even if the key is stored as a number.
            
       //Run if the request for transaction is successful
             getReq.onsuccess =(ev)=>
                    { 
                    LoadForm(ev.target.result); //NOTE: "ev.target.result" and "getReq.result" are equivalent.
                    }

     //Run whenever the transaction completes
       trans.oncomplete=(e)=>
        {
          //db.close();
        }
    });
};

//Run,if an error occured while trying to open the specified database.
request.onerror = (ev)=>
{
    console.log('You clicked' +ev.target);
    console.log(ev);

};

document.querySelector('#viewBtn').addEventListener('click',()=>
{

    DisplayDataByGetAll();
});




// --------------------------Helper Functions-------------------------------------

//Generates a random and unique number, to be used for primary key
function GetPryKey() 
{
    const id = Math.ceil(Math.random() * 100000000);
    return id.toString();
};

//Reset form data
function ResetForm() 
{
  formInput.reset();
};


viewByCursorBtn.addEventListener('click',(ev)=>
{
    console.log('view button clicked.');

    DisplayDataByCursor();
});

function LoadForm(obj) 
{
   
    fidInput.textContent = obj.Fid;//Write to textContent of the label always?.
    fnameInput.value = obj.Name;
    fscoreInput.value =  obj.Score;
    fgenderInput.value= obj.Gender;
    ftribeInput.value = obj.Tribe;
    factiveInput.checked = obj.IsActive;//Always use.checked for CheckedBox instead of .value for both set and get operations.
}



function RegisterNewFriend(ev,db) 
{
     ev.preventDefault();
     const trans = db.transaction(['Registery'],'readwrite'); //'readwrite' ,'readonly' e.t.c.
     const obj_OS = trans.objectStore('Registery');
     const objToSave ={ 
                          Fid:GetPryKey(),Name:fnameInput.value.trim(),Score:fscoreInput.value.trim(),
                          Gender:fgenderInput.value.trim(),Tribe: ftribeInput.value.trim(),IsActive:factiveInput.checked 
                      }; //Object to add to object store.

       const addReq = obj_OS.add (objToSave);

              addReq.onsuccess=(ev)=> //Run if add() is successful.
              {
                  console.log( 'Succesfully added' + fnameInput.value +' to the database.');                   
              };
              addReq.onerror=(ev)=> //Run if add() is failed.
              {
                console.log( 'Failed to added' + fnameInput.value +' to the database.');
              };

     
      trans.oncomplete=()=> //Run if the transaction is successful
      {
          console.log('Transaction completed succesfully.');
          ResetForm();
          DisplayDataByCursor();
          DisplayDataByGetAll();
          //db.close();
      }
      trans.onerror=(ev)=>//Run if the transaction fail
      {
          console.log('Transaction failed.');
          console.log(ev);
      }
};

function UpdateFriend(ev,db) 
{
     ev.preventDefault();
     const trans = db.transaction(['Registery'],'readwrite'); //'readwrite' ,'readonly' e.t.c.
     const obj_OS = trans.objectStore('Registery');

     const objToSave ={ 
                          Fid:fidInput.textContent,Name:fnameInput.value.trim(),Score:fscoreInput.value.trim(),
                          Gender:fgenderInput.value.trim(),Tribe: ftribeInput.value.trim(),IsActive:factiveInput.checked 
                      }; //Object to add to object store.

       const addReq = obj_OS.put (objToSave); //Put is used for updating data.

              addReq.onsuccess=(ev)=> //Run if add() is successful.
              {
                  console.log( 'Succesfully updated' + fnameInput.value +' in the database.');                   
              };
              addReq.onerror=(ev)=> //Run if add() is failed.
              {
                console.log( 'Failed to modify' + fnameInput.value +' in the database.');
              };

     
      trans.oncomplete=()=> //Run if the transaction is successful
      {
          console.log('Update transaction completed succesfully.');
          ResetForm();
          DisplayDataByCursor();
          DisplayDataByGetAll();
          regBtn.disabled=false;
          //db.close();
      }
      trans.onerror=(ev)=>//Run if the transaction fail
      {
          console.log('Update transaction failed.');
          console.log(ev);
      }
};

function DeleteFriend(ev,db) 
{

     ev.preventDefault();
     const trans = db.transaction(['Registery'],'readwrite'); //'readwrite' ,'readonly' e.t.c.
     const obj_OS = trans.objectStore('Registery');

       const addReq = obj_OS.delete (fidInput.textContent); //delete is used for deleting data.

              addReq.onsuccess=(ev)=> //Run if add() is successful.
              {
                  console.log( 'Succesfully deleted' + fnameInput.value +' from the database.');                   
              };
              addReq.onerror=(ev)=> //Run if add() is failed.
              {
                console.log( 'Failed to delete' + fnameInput.value +' from the database.');
              };

     
      trans.oncomplete=()=> //Run if the transaction is successful
      {
          console.log('Delete transaction completed succesfully.');
          ResetForm();
          DisplayDataByCursor();
          DisplayDataByGetAll();
          regBtn.disabled=false;
          //db.close();
      }
      trans.onerror=(ev)=>//Run if the transaction fail
      {
          console.log('Delete transaction failed.');
          console.log(ev);
      }
};


function DisplayDataByGetAll()
{

    let tbodyElem = document.querySelector('tbody');
    while (tbodyElem.firstChild) {
      tbodyElem.firstChild.remove();
    }


    console.log('lolo.');
    const db = request.result;

   const trans = db.transaction(['Registery'],'readonly');
   const obj_OS =trans.objectStore('Registery');

 const getAllRequest =  obj_OS.getAll();


 getAllRequest.onsuccess =()=>
 {
    let x =0;
    getAllRequest.result.forEach(p =>
         {
            x=x+1;
              const trow = document.createElement('tr');

              const td0 = document.createElement('td');
                    td0.textContent=x;

              const td1 = document.createElement('td');
                    td1.textContent=p.Name;
           
              const td2 = document.createElement('td');
                    td2.textContent=p.Score ;
           
              const td3 = document.createElement('td');
                    td3.textContent=p.Gender ;
           
              const td4 = document.createElement('td');
                    td4.textContent=p.Tribe ;
           
                    const td5 = document.createElement('td');
                    td5.textContent=p.IsActive ;
           
                    const td6 = document.createElement('td');
                    td6.innerHTML="<a href='#'>Select</a>";
                    td6.setAttribute('id',p.Fid);
                    td6.addEventListener('click',(e)=>
                    {
                        e.preventDefault();
                        LoadForm(p);
                    });        
           
           
                    trow.appendChild(td0);         
                    trow.appendChild(td1);
                    trow.appendChild(td2);
                    trow.appendChild(td3);
                    trow.appendChild(td4);
                    trow.appendChild(td5);
                    trow.appendChild(td6);
           
                   document.querySelector('tbody').appendChild(trow);

        });













 };


        

 


}

//Display all existing rows in the database by using cursor i.e one after the other.
function DisplayDataByCursor()
{
    const db = request.result;

   const trans = db.transaction(['Registery'],'readonly');
   const obj_OS =trans.objectStore('Registery');

   while (ulview.firstChild) //While there are firstchild in 'ul'
   {
       ulview.removeChild(ulview.firstChild);//if ulview has first child then remove the first child recursively.
   }

   const headin = document.createElement('h3'); //create <h3></h3>
   headin.textContent='Friends Registery Station A';//Turn <h3></h3> to <h3>Friends Registery Station A</h3>
   headin.setAttribute('style','text-align: center');//Turn to <h3 style="text-align:centre">Friends Registery Station A</h3> 

   const hr = document.createElement('hr'); //create <hr>

   ulview.appendChild(headin); //Add the newly create elements to 'ul'
   ulview.appendChild(hr); //Add the newly create elements to 'ul'

   const cursorReq =obj_OS.openCursor(); //Request to open a cursor
   
   cursorReq.onsuccess=(e)=>//If request to open the cursor succeeds, please run like forEach control.Use "cursor.continue()" to read the next row if there is still more row available.
   {   
        const cursor =e.target.result;
        if (cursor) //Run If the cursor is still has content.  
        {
            console.log( 'Cursor still has a content.');                   
            const liobj = document.createElement('li');
                  liobj.textContent=cursor.value.Name; //reads the Name property of the current cursor row position.

           const hrobj = document.createElement('hr');
           
            const p1 = document.createElement('p');
            p1.textContent= 'Score: ' + cursor.value.Score + ' | ' +'IsActive: ' + cursor.value.IsActive +' | ' +'Gender: ' + cursor.value.Gender + ' | ' + 'Tribe: ' + cursor.value.Tribe;

            liobj.appendChild(p1); 
            liobj.appendChild(hrobj);
            liobj.setAttribute('id',cursor.value.Fid);
 
          ulview.appendChild(liobj); 

            cursor.continue();//Used to tell compiler to run cursor again.
            console.log( 'Cursor operation is successful.');                   
        }
        else if(!ulview.firstChild)
        {
          const liobj = document.createElement('li');
                liobj.textContent="Loading..............";
                ulview.appendChild(liobj); 
        }

        
   }

   cursorReq.onerror=(e)=>
   {    
    console.log( 'Cursor operation is failed.');                   
   }
}

