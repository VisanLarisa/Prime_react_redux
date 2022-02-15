import { useEffect, useState } from 'react'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'

import { useNavigate } from 'react-router-dom';

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { FilterMatchMode } from 'primereact/api'

import { getArticles, addArticle, saveArticle, deleteArticle } from '../actions'

const articleSelector = state => state.article.articleList
const articleCountSelector = state => state.article.count

function ArticleList () {

  const navigate = useNavigate();   //for route navigation, preluat in cealalta de aceeasi constanta
  const [isDialogShown, setIsDialogShown] = useState(false)
  const [title, setTitle] = useState('')
  const [abstract, setAbstract] = useState('')
  const [date, setDate] =useState('')
  const [pageCount, setPageCount] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [filterString, setFilterString] = useState('')
  const [filters, setFilters] = useState({
    title: { value: null, matchMode: FilterMatchMode.CONTAINS },
    abstract: { value: null, matchMode: FilterMatchMode.CONTAINS }
  })
  const [page, setPage] = useState(0)
  const [first, setFirst] = useState(0)
  const [sortField, setSortFiels]=useState('')
  const [sortOrder, setSortOrder]=useState(1)

  const handleSort=(evt)=>{
      setSortFiels(evt.sortField)
      setSortOrder(evt.sortOrder)
  }

  const handleFilter = (evt) => {
    const oldFilters = filters
    oldFilters[evt.field] = evt.constraints.constraints[0]
    setFilters({ ...oldFilters })
  }

  const handleFilterClear = (evt) => {
    setFilters({
      title: { value: null, matchMode: FilterMatchMode.CONTAINS },
      abstract: { value: null, matchMode: FilterMatchMode.CONTAINS }
    })
  }

  useEffect(() => {
    const keys = Object.keys(filters)
    const computedFilterString = keys.map(e => {
      return {
        key: e,
        value: filters[e].value
      }
    }).filter(e => e.value).map(e => `${e.key}=${e.value}`).join('&')
    setFilterString(computedFilterString)
  }, [filters])

  const articles = useSelector(articleSelector, shallowEqual)
  const count = useSelector(articleCountSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getArticles(filterString, page, 4, sortField, sortOrder))
  }, [filterString, page, sortField, sortOrder])


  //for graphic
  // const [chartData, setChartData]=useState('')
  // const chartOptions={
  //   chart:{
  //       title: 'Articles',
  //       subtitle: 'Number of pages'
  //   }
  // }

  // useEffect(()=>{
  //   const data= [['Title', 'Pages']]
  //   for( const article of articles)
  //       {data.push([article.title, article.pageCount])}
  //   setChartData(data)
  // }, [articles])

  const handleAddClick = (evt) => {
    setIsDialogShown(true)
    setIsNewRecord(true)
    setTitle('')
    setAbstract('')
    setDate('')
    // setSelected(null);
  }

  const hideDialog = () => {
    setIsDialogShown(false)
  }

  const handleSaveClick = () => {
    if (isNewRecord) {
      dispatch(addArticle({ title, abstract, date, pageCount }))
    } else {
      dispatch(saveArticle(selectedArticle, { title, abstract, date, pageCount }))
    }
    setIsDialogShown(false)
    setSelectedArticle(null)
    setTitle('')
    setAbstract('')
    setDate('')
    setPageCount(0)
  }

  const editArticle = (rowData) => {
    setSelectedArticle(rowData.id)
    setTitle(rowData.title)
    setAbstract(rowData.abstract) //pt dialog
    setDate(rowData.date)
    setIsDialogShown(true)
    setIsNewRecord(false)
  }

  const navArticle=(rowData)=>{
    setSelectedArticle(rowData.id)
  //  navigate('/articles/${rowData.id}')
    navigate("/articles/"+rowData.id)
    console.log("/articles/"+rowData.id)
   // dispatch(openArticle(selectedArticle, {title, abstract, date, pageCount}))

  }

  const handleDeleteArticle = (rowData) => {
    dispatch(deleteArticle(rowData.id))
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
        <Button label='Edit' icon='pi pi-pencil' onClick={() => editArticle(rowData)} />
        <Button label='Delete' icon='pi pi-times' className='p-button p-button-danger' onClick={() => handleDeleteArticle(rowData)} />
        {/* <Link to="/sync">   <Button Label='Edit' icon='pi pi-pencil'  href='/logOut' />  </Link> */}
        <Button Label='Edit' icon='pi pi-pencil' onClick={() => navArticle(rowData)} />
      </div>
    )
  }

  const handlePageChange = (evt) => {
    setPage(evt.page)
    setFirst(evt.page * 4)
  }

  return (


    <div>
      {/* <Chart chartType='Bar' width='100%' height='400px' data={chartData} options={chartOptions} /> */}
      <div class="components">
      <DataTable  value={articles} footer={tableFooter}
        lazy        
        paginator onPage={handlePageChange}
        first={first}
        rows={4}
        totalRecords={count}
        onSort={handleSort} sortField={sortField} sortOrder={sortOrder}
      >
        <Column header='Title' field='title' filter filterField='title' filterPlaceholder='filter by title' onFilterApplyClick={handleFilter} onFilterClear={handleFilterClear} sortable />
        <Column header='Abstract' field='abstract' filter filterField='abstract' filterPlaceholder='filter by abstract' onFilterApplyClick={handleFilter} onFilterClear={handleFilterClear} sortable />
        <Column header='date' field='date' />
        <Column header='Page count' field='pageCount' />
        {/* <Column header='References' field='<ArticleList />' /> */}
        <Column header='Options' body={opsColumn} />
      </DataTable>
      </div>
      
      <Dialog header='An article' visible={isDialogShown} onHide={hideDialog} footer={dialogFooter}>
        <div>
          <InputText placeholder='title' onChange={(evt) => setTitle(evt.target.value)} value={title} />
        </div>
        <div>
          <InputText placeholder='abstract' onChange={(evt) => setAbstract(evt.target.value)} value={abstract} />
        </div>
        <div>
          <InputText placeholder='date' onChange={(evt) => setDate(evt.target.value)} value={date} />
        </div>
        <div>
          <InputText placeholder='page count' onChange={(evt) => setPageCount(evt.target.value)} value={pageCount} />
        </div>
      </Dialog>
    </div>
  )
}

export default ArticleList