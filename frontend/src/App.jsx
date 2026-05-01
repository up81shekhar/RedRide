import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Start                    from './pages/Start';
import Home                     from './pages/Home';
import UserLogin                from './pages/UserLogin';
import UserSignup               from './pages/UserSignup';
import CaptainLogin             from './pages/CaptainLogin';
import CaptainSignup            from './pages/CaptainSignup';
import UserProtectWrapper       from './pages/UserProtectWrapper';
import UserLogout               from './pages/UserLogout';
import CaptainHome              from './pages/CaptainHome';
import CaptainProtectWrapper    from './pages/CaptainProtectedWrapper';
import CaptainLogout            from './pages/CaptainLogout';
import RidingPage               from './pages/RidingPage';
import CaptainRiding            from './pages/CaptainRiding';

const App = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"                element={<Start />} />
      <Route path="/login"           element={<UserLogin />} />
      <Route path="/signup"          element={<UserSignup />} />
      <Route path="/captain-login"   element={<CaptainLogin />} />
      <Route path="/captain-signup"  element={<CaptainSignup />} />

      {/* User protected */}
      <Route path="/home" element={
        <UserProtectWrapper><Home /></UserProtectWrapper>
      } />
      <Route path="/riding" element={
        <UserProtectWrapper><RidingPage /></UserProtectWrapper>
      } />
      <Route path="/user/logout" element={
        <UserProtectWrapper><UserLogout /></UserProtectWrapper>
      } />

      {/* Captain protected */}
      <Route path="/captain-home" element={
        <CaptainProtectWrapper><CaptainHome /></CaptainProtectWrapper>
      } />
      <Route path="/captain-riding" element={
        <CaptainProtectWrapper><CaptainRiding /></CaptainProtectWrapper>
      } />
      <Route path="/captain/logout" element={
        <CaptainProtectWrapper><CaptainLogout /></CaptainProtectWrapper>
      } />
    </Routes>
  );
};

export default App;