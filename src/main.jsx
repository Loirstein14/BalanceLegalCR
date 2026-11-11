import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom'; 
import App from './App';
import { Home } from './components/Home/Home';
import { PageNotFound } from './components/Home/PageNotFound';
import { CatalogProducts } from './components/Product/CatalogProducts';
import { DetailProduct } from './components/Product/DetailProduct';
import TableProducts from './components/Product/TableProducts';
import TableInvoices from './components/Invoice/TableInvoices';
import { DetailInvoice } from './components/Invoice/DetailInvoice';
import { ListAppointments } from './components/Appointment/ListAppointments';
import { DetailAppointment } from './components/Appointment/DetailAppointment';
import TableServices from './components/Service/TableServices';
import { DetailService } from './components/Service/DetailService';
import { CreateService } from './components/Service/CreateService';
import { UpdateService } from './components/Service/UpdateService';
import { CreateProduct } from './components/Product/CreateProduct';
import { UpdateProduct } from './components/Product/UpdateProduct';
import TableBranches from './components/Branch/TableBranches';
import { DetailBranch } from './components/Branch/DetailBranch';
import { CreateBranch } from './components/Branch/CreateBranch';
import { UpdateBranch } from './components/Branch/UpdateBranch';
import TableSchedules from './components/Schedule/TableSchedules';
import { DetailSchedule } from './components/Schedule/DetailSchedule';
import { CreateSchedule } from './components/Schedule/CreateSchedule';
import { UpdateSchedule } from './components/Schedule/UpdateSchedule';
import TableBlocks from './components/Block/TableBlocks';
import { DetailBlock } from './components/Block/DetailBlock';
import { CreateBlock } from './components/Block/CreateBlock';
import { UpdateBlock } from './components/Block/UpdateBlock';

const rutas = createBrowserRouter( 
  [     { 
      element: <App />,       
      children: [ 
        { 
          path: '/', 
          element: <Home /> 
        },
        {
          path: '/product',
          element: <CatalogProducts />
        },
        {
          path: '/product/:id',
          element: <DetailProduct />
        },
        {
          path: '/product-table',
          element: <TableProducts />
        },
        {
          path: '/product/create',
          element: <CreateProduct />
        },
        {
          path: '/product/update/:id',
          element: <UpdateProduct />
        },
        {
          path: '/invoice',
          element: <TableInvoices />
        },
        {
          path: '/invoice/:id',
          element: <DetailInvoice />
        },
        {
          path: '/appointment',
          element: <ListAppointments />
        },
        {
          path: '/appointment/:id',
          element: <DetailAppointment />
        },
        {
          path: '/service-table',
          element: <TableServices />
        },
        {
          path: '/service/create',
          element: <CreateService />
        },
        {
          path: '/service/update/:id',
          element: <UpdateService />
        },
        {
          path: '/service/:id',
          element: <DetailService />
        },
        {
          path: '/branch-table',
          element: <TableBranches />
        },
        {
          path: '/branch/create',
          element: <CreateBranch />
        },
        {
          path: '/branch/update/:id',
          element: <UpdateBranch />
        },
        {
          path: '/branch/:id',
          element: <DetailBranch />
        },
        {
          path: '/schedule-table',
          element: <TableSchedules />
        },
        {
          path: '/schedule/create',
          element: <CreateSchedule />
        },
        {
          path: '/schedule/update/:id',
          element: <UpdateSchedule />
        },
        {
          path: '/schedule/:id',
          element: <DetailSchedule />
        },
        {
          path: '/block-table',
          element: <TableBlocks />
        },
        {
          path: '/block/create',
          element: <CreateBlock />
        },
        {
          path: '/block/update/:id',
          element: <UpdateBlock />
        },
        {
          path: '/block/:id',
          element: <DetailBlock />
        },
        {
          path: '*',
          element: <PageNotFound />
        },

      ], 
    }, 
  ], ); 
createRoot(document.getElementById('root')).render( 
  <StrictMode> 
      <RouterProvider router={rutas} /> 
  </StrictMode>, 
); 
