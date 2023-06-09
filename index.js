
let idInput = document.querySelector('#fid');
let nameInput = document.querySelector('#name');
let ratingInput = document.querySelector('#rating');
let tribeInput = document.querySelector('#tribe');
const form = document.querySelector('form');

const showInput = document.querySelector('#show');
const ulElement = document.querySelector('ul');
const tableBodyElement = document.querySelector('#tablerow');
const deleteBtn = document.querySelector('#delID');




const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || shimIndexedDB;
//const db =null;


window.onload =(ev)=>{

const request = indexedDB.open("PadiRegistry",1);

    request.onupgradeneeded =(ev)=>
    {
       const dbHandle =request.result;

        if(ev.oldVersion == 0){
            console.log('Database does not exist' );

          const padi_OS =  dbHandle.createObjectStore("Padi",{keyPath:'pid'});
                padi_OS.createIndex("TribeIndex",["Tribe"],{unique:false});
        }
    }

    request.onsuccess =(ev)=>
    {
      const  dbHandle =request.result;

        form.onsubmit =()=>
        {
            AddPadi(dbHandle); 
        };

        // selectedRow.addEventListener('click',()=>
        // {
        //     console.log('Clicked table row' );
    
        // });



        showInput.addEventListener('click',()=>
        {
            console.log('show button clicked' );
            DisplayPadi(dbHandle); 


            
       
        });



     };


    


    request.onerror =(ev)=>
    {
        console.log('olversion ' +ev.oldVersion );
        console.log('newversion ' +ev.newVersion );
        console.log(ev.target);
    }



    deleteBtn.addEventListener('click',(ev)=>{
        
        console.log('loaded fid ' +idInput.value );



        RemovePadi(idInput.value ,nameInput.value) ;
        //ResetForm();

    })

//-----------------------------------------

function IdGenerator() {
    
    return Math.ceil(Math.random() * 100000000) ;
}


function AddPadi(dbHandle) 
{
    const trans =  dbHandle.transaction('Padi','readwrite');
    const padi_OSHandle = trans.objectStore('Padi');
    const obj = { pid:IdGenerator(),Name:nameInput.value.trim(),Rating:ratingInput.value.trim(),Tribe:tribeInput.value.trim()};
    //const obj = { Name:nameInput.value.trim(),Rating:ratingInput.value.trim(),Tribe:tribeInput.value.trim()};


 padi_OSHandle.add(obj);




    trans.oncomplete=(ev)=>
    {
      console.log('Succesfully registered' +nameInput.value+'.' );
    };
    trans.onerror=(ev)=>
    {
      console.log('Fail to register' +nameInput.value+'. Try again!.' );
      console.log(ev );
    }
 };


    function DisplayPadi(dbHandle) 
    {
        

     const trans =  dbHandle.transaction('Padi','readonly');
            const padi_OSHandle = trans.objectStore('Padi');
           
            // while (list.firstChild) {
            //     list.removeChild(list.firstChild);
            //   }

            

            while (tableBodyElement.firstChild) {
                tableBodyElement.removeChild(tableBodyElement.firstChild);
            }

            let x =1;
         const cursorReq =  padi_OSHandle.openCursor();
         cursorReq.onsuccess =(ev)=>
                                    {
                                    const cursor = ev.target.result;
                                    
                                       if (cursor) 
                                        {
                                          const tr1 =  document.createElement('tr');
                                                tr1.setAttribute('data-pid',cursor.value.pid);
                                                tr1.addEventListener('click',(ev)=>{
                                                    console.log('Clicked table row' );
                                                   // console.log(ev.target.parentNode.getAttribute('data-pid'));
                                                   // RemovePadi(ev.target.parentNode.getAttribute('data-pid'),cursor.value.Name); 
                                                    LoadForm(Number(ev.target.parentNode.getAttribute('data-pid'))); 
                                                });






                                          const p0 =  document.createElement('td');
                                                p0.textContent = x;

                                           const p1 =  document.createElement('td');
                                                 p1.textContent = cursor.value.Name;

                                           const p2 =  document.createElement('td');
                                                 p2.textContent = cursor.value.Rating;

                                           const p3 =  document.createElement('td');
                                                 p3.textContent = cursor.value.Tribe;

                                                tr1.appendChild(p0);
                                                tr1.appendChild(p1);
                                                tr1.appendChild(p2);
                                                tr1.appendChild(p3);

                                           tableBodyElement.appendChild(tr1);
                                           x =x + 1;
                                            cursor.continue();
                                        }
                                        else
                                        {

                                        }
                                    }


    }

    function LoadForm(key) 
    {
        const dbHandle =request.result;
        const trans =  dbHandle.transaction('Padi','readonly');
        const padi_OSHandle = trans.objectStore('Padi');

        const formObjRequest =  padi_OSHandle.get(key);

        formObjRequest.onsuccess =()=>{
           
            idInput.value = formObjRequest.result.pid;
            nameInput.value = formObjRequest.result.Name;
            ratingInput.value = formObjRequest.result.Rating;
           tribeInput.value= formObjRequest.result.Tribe; 

        }
        
        trans.oncomplete=(ev)=>
        {
          console.log( formObjRequest.result.Name +' record selected.' );
        };


    }





    function RemovePadi(ev,nameRemoved) 
    {
        const  dbHandle =request.result;
        const trans =  dbHandle.transaction('Padi','readwrite');
        const padi_OSHandle = trans.objectStore('Padi');
        padi_OSHandle.delete(Number(ev) );

        trans.oncomplete=(ev)=>
        {
            DisplayPadi(dbHandle) ;
          console.log('Succesfully deregister' + nameRemoved +'.' );
        };
        trans.onerror=(ev)=>
        {
          console.log('Fail to remove' + nameRemoved +'. Try again!.' );
        }
     };


     function ResetForm()
      {
//ev.PreventDefault();
         form.reset() ;
     }





}

