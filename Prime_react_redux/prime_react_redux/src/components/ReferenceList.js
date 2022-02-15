import {useParams} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'

import { getReferences, addReference, saveReference, deleteReference } from '../actions'
import useFetch from './useFetch';

const referenceSelector = state => state.reference.referenceList
// const referenceCountSelector = state => state.article.count

const ReferenceList=()=>{

  const [isDialogShown, setIsDialogShown]= useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [authors, setAuthors] = useState('')

//   const [pageCount, setPageCount] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(true)
  const [selectedReference, setSelectedReference] = useState(null)

  const references = useSelector(referenceSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getReferences(id))
  }, [dispatch])


  const handleAddClick = (evt) => {
    setIsDialogShown(true)
    setIsNewRecord(true)
    setTitle('')
    setDate('')
    setAuthors('')
  }

  const hideDialog = () => {
    setIsDialogShown(false)
  }

  const handleSaveClick = () => {
    if (isNewRecord) {
      dispatch(addReference(id, { title, date, authors }))
    } else {
      dispatch(saveReference(id, selectedReference, { title, date, authors }))
    }
    setIsDialogShown(false)
    setSelectedReference(null)
    setTitle('')
    setDate('')
    setAuthors('')
    // setPageCount(0)
  }

  const editReference = (rowData) => {
    setSelectedReference(rowData.id)
    setTitle(rowData.title)
    setDate(rowData.date) //pt dialog
    setAuthors(rowData.authors)
    setIsDialogShown(true)
    setIsNewRecord(false)
  }

  const handleDeleteReference = (rowData) => {
    dispatch(deleteReference(id, rowData.id))
  }

  
  const tableFooter = (
    <div>
      <Button label='Add' icon='pi pi-plus' onClick={handleAddClick} />
    </div>
  )

  const dialogFooter = (
    <div>
      <Button label='Save' icon='pi pi-save' onClick={handleSaveClick} />
    </div>
  )

  const opsColumn = (rowData) => {
    return (
      <div>
        <Button label='Edit' icon='pi pi-pencil' onClick={() => editReference(rowData)} />
        <Button label='Delete' icon='pi pi-times' className='p-button p-button-danger' onClick={() => handleDeleteReference(rowData)} />
        {/* <Link to="/sync">   <Button Label='Edit' icon='pi pi-pencil'  href='/logOut' />  </Link> */}
        {/* <Button Label='Edit' icon='pi pi-pencil' onClick={() => navArticle(rowData)} /> */}
      </div>
    )
  }


//CA SA AFISEZE PT FIECARE ID
    const {id} =useParams();    //parametrii din path definiti in App.js
    const {data: article, error, isPending}=useFetch(`http://localhost:8080/articles/${id}`) //pt a obtine descrierea cartii, folosesc un CUSTOM HOOK, cu link catre baza de date

    console.log('Reference received article id' +id);
    const navigate = useNavigate(); //ca sa preiau
    return(
    <>
        <div>       
            {isPending && <div> Loading...</div>}
            {error && <div>{error}</div>}
            {article && (
                <article>
                    <h2>Article "{article.title}"</h2>
                    <h2>Abstract: {article.abstract}</h2>
                    <h2> Published on date: {article.date}</h2>
                    <h2>No. pages: {article.pageCount}</h2>
                    {/* <div>Body: {article.body}</div> */}
                </article>
            )}
         </div>  {/*keep the format         */}
        <DataTable value={references} footer={tableFooter}>
            <Column header='Reference Title' field='title' />
            <Column header='Reference date' field='date' />
            <Column header='Reference Authors' field='authors' />
            <Column header='Options' body={opsColumn} />
        </DataTable>

        <Dialog header='A New Reference' visible={isDialogShown} onHide={hideDialog} footer={dialogFooter}>
        <div>
          <InputText placeholder='title' onChange={(evt) => setTitle(evt.target.value)} value={title} />
        </div>
        <div>
          <InputText placeholder='date' onChange={(evt) => setDate(evt.target.value)} value={date} />
        </div>
        <div>
          <InputText placeholder='authors' onChange={(evt) => setAuthors(evt.target.value)} value={authors} />
        </div>
      </Dialog>

        <Button label='go back' onClick={()=>navigate(-1)} />
    </>
    )
}

export default ReferenceList;