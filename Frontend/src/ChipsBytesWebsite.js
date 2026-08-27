/**
 * @file ChipsBytesWebsite.js
 * @description
 * Root component for the Chips & Bytes website.
 * Renders the main HomePage component.
 * 
 * @component
 * @returns {JSX.Element}
 */

import React from 'react';
import HomePage from './components/Pages/HomePage';

const ChipsBytesWebsite = () => (
  <div className="app">
    <HomePage />
  </div>
);

export default ChipsBytesWebsite;
