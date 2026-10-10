import React, { createContext, useContext } from 'react';
const RouteContext = createContext('/en');
export const RouteProvider = RouteContext.Provider;
export const useRoutePath = () => useContext(RouteContext);
