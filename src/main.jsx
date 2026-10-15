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
