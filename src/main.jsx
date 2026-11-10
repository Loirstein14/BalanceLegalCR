import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
//Mensajes de Yup en español (se cargan una sola vez para toda la app)
import './utils/yupLocale';
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
import { ServiceForm } from './components/Service/ServiceForm';
import { ProductForm } from './components/Product/ProductForm';

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
          element: <ProductForm />
        },
        {
          path: '/product/update/:id',
          element: <ProductForm />
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
          element: <ServiceForm />
        },
        {
          path: '/service/update/:id',
          element: <ServiceForm />
        },
        {
          path: '/service/:id',
          element: <DetailService />
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
