import React, { useEffect, useMemo, useRef, useState } from "react";

import "./index.css";

const initialUsers = [

  { id: 1, name: "Administrador", cpf: "99999999999", password: "123456", role: "admin", active: true },

  { id: 2, name: "Carlos Silva", cpf: "11111111111", password: "123456", role: "inspector", active: true },

  { id: 3, name: "Mariana Costa", cpf: "22222222222", password: "123456", role: "manager", active: true },

];

const initialWorks = [

  { id: 1, code: "OBR-2026-014", name: "Residencial Aurora", address: "Rua Nova Brasil, Salvador - Bahia", progress: 72, pending: 4, total: 18 },

  { id: 2, code: "OBR-2026-008", name: "Edifício Horizonte", address: "Castelo Branco, Salvador - Bahia", progress: 45, pending: 7, total: 22 },

  { id: 3, code: "OBR-2025-031", name: "Parque das Oliveiras", address: "Canabrava, Salvador - Bahia", progress: 88, pending: 2, total: 15 },

];

const seedIssues = [

  { id: "NC-024", title: "Revestimento com falhas", work: initialWorks[0].name, place: "Torre A · 3º andar", status: "Pendente", date: "05/11/2026", description: "Foram identificadas falhas no acabamento do revestimento da parede.", severity: "Média" },

  { id: "NC-023", title: "Instalação elétrica exposta", work: initialWorks[1].name, place: "Bloco B · 2º andar", status: "Em análise", date: "04/11/2026", description: "Ponto de instalação elétrica sem proteção adequada.", severity: "Alta" },

  { id: "NC-022", title: "Trinca na alvenaria", work: initialWorks[2].name, place: "Área externa", status: "Concluída", date: "03/11/2026", description: "Trinca identificada próxima à entrada de serviço.", severity: "Baixa" },

];

const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };

const fmtCpf = v => v.replace(/\D/g,"").slice(0,11).replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2");

const roleName = r => ({admin:"Administrador", inspector:"Vistoriador", manager:"Gestor"}[r] || r);

function App(){

  const [users,setUsers]=useState(()=>read("oc_users",initialUsers));

  const [session,setSession]=useState(()=>read("oc_session",null));

  const [works]=useState(initialWorks);

  const [issues,setIssues]=useState(()=>read("oc_issues",seedIssues).map(i => ({...i, work: ({"Residencial Parque das Flores":"Residencial Aurora","Edifício Vista Mar":"Edifício Horizonte","Centro Empresarial Atlântico":"Parque das Oliveiras"})[i.work] || i.work})));

  const [page,setPage]=useState("login");

  const [cpf,setCpf]=useState(""); const [password,setPassword]=useState(""); const [showPass,setShowPass]=useState(false); const [error,setError]=useState("");

  const [selectedWork,setSelectedWork]=useState(null); const [filter,setFilter]=useState("Todas"); const [selectedIssue,setSelectedIssue]=useState(null);

  const [workSearch,setWorkSearch]=useState("");
  const [managerFilter,setManagerFilter]=useState("Todas");

  const [menu,setMenu]=useState(false); const [logoutOpen,setLogoutOpen]=useState(false);

  const [form,setForm]=useState({title:"",place:"",description:"",severity:"Média"}); const [stage,setStage]=useState("form"); const [photoNames,setPhotoNames]=useState([]);

  const [photoPreviews,setPhotoPreviews]=useState([]);

  const [issueEvidence,setIssueEvidence]=useState({}); // Evidências temporárias nesta sessão

  const [editingIssueId,setEditingIssueId]=useState(null);
  const [managerDraftStatus,setManagerDraftStatus]=useState("Pendente");
  const [managerDraftNote,setManagerDraftNote]=useState("");
  const [managerSaveMessage,setManagerSaveMessage]=useState("");
  const [managerIssueFilter,setManagerIssueFilter]=useState("Todas");

  function openIssueDetails(issue){
    setSelectedIssue(issue);
    setManagerDraftStatus(issue.status || "Pendente");
    setManagerDraftNote("");
    setManagerSaveMessage("");
    setPage("issue");
  }

  function saveManagerAnalysis(){
    if (!selectedIssue || session?.role !== "manager") return;
    const note=managerDraftNote.trim();
    if (!note && managerDraftStatus === selectedIssue.status){
      setManagerSaveMessage("Selecione um novo status ou escreva uma observação antes de salvar.");
      return;
    }
    const timestamp=new Date();
    const action={
      id:`${timestamp.getTime()}-${Math.random().toString(36).slice(2,7)}`,
      type:"analysis",actor:current?.name || "Gestor",
      date:timestamp.toLocaleDateString("pt-BR"),
      time:timestamp.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}),
      fromStatus:selectedIssue.status,toStatus:managerDraftStatus,note
    };
    const updated={...selectedIssue,status:managerDraftStatus,history:[...(selectedIssue.history||[]),action]};
    setIssues(prev=>prev.map(i=>i.id===updated.id?updated:i));
    setSelectedIssue(updated);
    setManagerDraftNote("");
    setManagerSaveMessage("Análise salva com sucesso.");
  }


  const photoUrlsRef=useRef([]);

  function clearPhotos(){

    photoUrlsRef.current.forEach(url=>URL.revokeObjectURL(url));

    photoUrlsRef.current=[];

    setPhotoPreviews([]);

    setPhotoNames([]);

  }

  function choosePhotos(event){

    const files=Array.from(event.target.files || []).filter(file=>file.type.startsWith("image/"));

    photoUrlsRef.current.forEach(url=>URL.revokeObjectURL(url));

    const previews=files.map(file=>({name:file.name,url:URL.createObjectURL(file)}));

    photoUrlsRef.current=previews.map(photo=>photo.url);

    setPhotoPreviews(previews);

    setPhotoNames(files.map(file=>file.name));

  }

  const [audioStatus,setAudioStatus]=useState("idle");

  const [audioUrl,setAudioUrl]=useState("");

  const [audioError,setAudioError]=useState("");

  const [audioDuration,setAudioDuration]=useState(0);

  const recorderRef=useRef(null);

  const streamRef=useRef(null);

  const chunksRef=useRef([]);

  const audioUrlRef=useRef("");

  function clearAudio(){

    if(recorderRef.current && recorderRef.current.state!=="inactive"){

      recorderRef.current.onstop=null;

      recorderRef.current.stop();

    }

    streamRef.current?.getTracks().forEach(track=>track.stop());

    recorderRef.current=null;

    streamRef.current=null;

    chunksRef.current=[];

    if(audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);

    audioUrlRef.current="";

    setAudioUrl("");

    setAudioStatus("idle");

    setAudioDuration(0);

    setAudioError("");

  }

  // Converte a gravação para WAV, com duração reconhecida pelo player HTML5.

  async function toPlayableWav(recordedBlob){

    const AudioContextClass=window.AudioContext || window.webkitAudioContext;

    if(!AudioContextClass) throw new Error("AudioContext indisponível");

    const context=new AudioContextClass();

    try{

      const buffer=await context.decodeAudioData(await recordedBlob.arrayBuffer());

      if(!buffer.length || buffer.duration <= 0) throw new Error("Gravação vazia");

      const channels=Math.min(buffer.numberOfChannels,2);

      const sampleRate=buffer.sampleRate;

      const bytes=new ArrayBuffer(44 + buffer.length * channels * 2);

      const view=new DataView(bytes);

      const write=(offset,str)=>{for(let i=0;i<str.length;i++) view.setUint8(offset+i,str.charCodeAt(i));};

      write(0,"RIFF"); view.setUint32(4,36+buffer.length*channels*2,true);

      write(8,"WAVE"); write(12,"fmt "); view.setUint32(16,16,true);

      view.setUint16(20,1,true); view.setUint16(22,channels,true);

      view.setUint32(24,sampleRate,true); view.setUint32(28,sampleRate*channels*2,true);

      view.setUint16(32,channels*2,true); view.setUint16(34,16,true);

      write(36,"data"); view.setUint32(40,buffer.length*channels*2,true);

      const data=Array.from({length:channels},(_,i)=>buffer.getChannelData(i));

      let pos=44;

      for(let i=0;i<buffer.length;i++) for(let c=0;c<channels;c++){

        const value=Math.max(-1,Math.min(1,data[c][i]));

        view.setInt16(pos,value<0?value*0x8000:value*0x7fff,true);

        pos+=2;

      }

      return {blob:new Blob([bytes],{type:"audio/wav"}),duration:buffer.duration};

    }finally{await context.close();}

  }

  async function startAudio(){

    setAudioError("");

    if(!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder==="undefined"){

      setAudioError("Este navegador não oferece gravação de áudio. Use Chrome ou Edge em localhost ou HTTPS.");

      return;

    }

    try{

      const stream=await navigator.mediaDevices.getUserMedia({audio:true});

      streamRef.current=stream;

      chunksRef.current=[];

      const recorder=new MediaRecorder(stream);

      recorderRef.current=recorder;

      recorder.ondataavailable=event=>{if(event.data.size>0) chunksRef.current.push(event.data);};

      recorder.onstop=async ()=>{

        stream.getTracks().forEach(track=>track.stop());

        streamRef.current=null;

        const chunks=[...chunksRef.current];

        if(!chunks.length){

          setAudioStatus("idle");

          setAudioError("Nenhum áudio foi capturado. Grave por pelo menos 3 segundos.");

          return;

        }

        setAudioStatus("processing");

        try{

          const recordedBlob=new Blob(chunks,{type:recorder.mimeType||chunks[0].type||"audio/webm"});

          const result=await toPlayableWav(recordedBlob);

          if(audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);

          const url=URL.createObjectURL(result.blob);

          audioUrlRef.current=url;

          setAudioUrl(url);

          setAudioDuration(result.duration);

          setAudioStatus("ready");

        }catch(error){

          setAudioStatus("idle");

          setAudioError("Não foi possível preparar o áudio. Tente gravar novamente no Chrome ou Edge.");

        }

      };

      recorder.onerror=()=>{

        stream.getTracks().forEach(track=>track.stop());

        setAudioStatus("idle");

        setAudioError("Não foi possível concluir a gravação.");

      };

      recorder.start(250);

      setAudioStatus("recording");

    }catch(err){

      setAudioStatus("idle");

      setAudioError(err?.name==="NotAllowedError"?"Permita o acesso ao microfone nas configurações do navegador.":"Não foi possível acessar o microfone. Verifique o dispositivo e tente novamente.");

    }

  }

  function stopAudio(){

    if(recorderRef.current?.state==="recording") recorderRef.current.stop();

  }

  useEffect(()=>()=>{

    if(recorderRef.current?.state==="recording") recorderRef.current.stop();

    streamRef.current?.getTracks().forEach(track=>track.stop());

    if(audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);

    photoUrlsRef.current.forEach(url=>URL.revokeObjectURL(url));

  },[]);

  const [userForm,setUserForm]=useState({name:"",cpf:"",password:"",role:"inspector"}); const [editing,setEditing]=useState(null);

  useEffect(()=>localStorage.setItem("oc_users",JSON.stringify(users)),[users]);

  useEffect(()=>localStorage.setItem("oc_session",JSON.stringify(session)),[session]);

  useEffect(()=>localStorage.setItem("oc_issues",JSON.stringify(issues)),[issues]);

  useEffect(()=>{ if(session) setPage(session.role==="admin"?"admin":session.role==="manager"?"manager":"works"); else setPage("login"); },[]);

  const current=users.find(u=>session && u.id===session.id);

  const myIssues=useMemo(()=>issues.filter(i=>!selectedWork || i.work===selectedWork.name),[issues,selectedWork]);

  function login(e){e.preventDefault(); const found=users.find(u=>u.cpf===cpf.replace(/\D/g,"") && u.password===password && u.active); if(!found){setError("CPF ou senha inválidos.");return;} setSession({id:found.id,role:found.role});setError("");setPage(found.role==="admin"?"admin":found.role==="manager"?"manager":"works");}

  function logout(){setSession(null);setSelectedWork(null);setMenu(false);setLogoutOpen(false);setCpf("");setPassword("");setPage("login");}

  function addIssue(){

    const existing = editingIssueId ? issues.find(i => i.id === editingIssueId) : null;

    const item = {

      ...(existing || {}),

      id: existing?.id || `NC-${String(issues.length+25).padStart(3,"0")}`,

      title: form.title, work: selectedWork.name, place: form.place,

      description: form.description, severity: form.severity,

      status: existing?.status || "Pendente",
       originalStatus: existing?.originalStatus || existing?.status || "Registrada",

      date: existing?.date || new Date().toLocaleDateString("pt-BR"),

      inspector: existing?.inspector || current?.name || "Vistoriador",

      time: existing?.time || new Date().toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"})

    };

    // Preserva as URLs dos arquivos até a página ser recarregada. Não envia ao backend.

    const previous = issueEvidence[item.id] || {};

    const photos = photoPreviews.length ? [...photoPreviews] : (existing ? previous.photos || [] : []);

    const audio = audioUrl || (existing ? previous.audio || "" : "");

    setIssueEvidence(prev => ({...prev,[item.id]:{photos,audio,duration:audioUrl ? audioDuration : previous.duration || 0}}));

    if (editingIssueId) setIssues(prev => prev.map(i => i.id === item.id ? item : i));

    else setIssues(prev => [item,...prev]);

    // Os links temporários passam a pertencer ao registro e não são revogados aqui.

    photoUrlsRef.current=[];

    audioUrlRef.current="";

    clearPhotos(); clearAudio(); setEditingIssueId(null);

    setSelectedIssue(item); setStage("success"); setPage("success");

  }

  function editIssue(){

    if (!selectedIssue || !selectedWork) return;

    setEditingIssueId(selectedIssue.id);

    setForm({title:selectedIssue.title || "",place:selectedIssue.place || "",description:selectedIssue.description || "",severity:selectedIssue.severity || "Média"});

    clearPhotos(); clearAudio(); setStage("form"); setPage("newissue");

  }

  function saveUser(e){e.preventDefault();const clean=userForm.cpf.replace(/\D/g,"");if(clean.length!==11){alert("Informe um CPF com 11 dígitos.");return;}if(users.some(u=>u.cpf===clean && u.id!==editing)){alert("Este CPF já está cadastrado.");return;}if(editing){setUsers(users.map(u=>u.id===editing?{...u,...userForm,cpf:clean}:u));}else{setUsers([...users,{...userForm,id:Date.now(),cpf:clean,active:true}]);}setEditing(null);setUserForm({name:"",cpf:"",password:"",role:"inspector"});}

  function startEdit(u){setEditing(u.id);setUserForm({name:u.name,cpf:fmtCpf(u.cpf),password:u.password,role:u.role});window.scrollTo({top:0,behavior:"smooth"});}

  const Header=({title,sub})=><header className="topbar"><div className="brand-mini"><span className="brand-mark">OC</span><b>Obra<span>Check</span></b></div><div className="top-title"><b>{title}</b><small>{sub}</small></div><div className="profile-wrap"><button className="profile-btn" onClick={()=>setMenu(!menu)}><span className="avatar">{(current?.name||"U").split(" ").map(x=>x[0]).slice(0,2).join("")}</span><span className="profile-name">{current?.name}<small>{roleName(session?.role)}</small></span><span>⌄</span></button>{menu&&<div className="dropdown logout-dropdown"><button type="button" className="logout-option" onClick={()=>{setMenu(false);setLogoutOpen(true)}}>Sair da conta</button></div>}</div></header>;

  const issueRows=(items)=> <div className="issue-list">{items.map(i=><button className="issue-row" key={i.id} onClick={()=>{openIssueDetails(i);}}><span className="issue-icon">▤</span><span className="issue-main"><b>{i.title}</b><small>{i.id} · {i.work}</small></span><span className={`status ${i.status==="Concluída"?"done":i.status==="Em análise"?"review":""}`}>{i.status}</span><span className="arrow">›</span></button>)}</div>;

  return <div className="app">

    {page === "login" && (

      <main className="login-shell">

        <section className="login-card">

          <div className="logo">

            <img src="/assets/logo-obracheck.png" alt="ObraCheck" className="login-logo" />

          </div>

          <h1>Entrar</h1>

          <p className="muted center">Acesse suas vistorias e registre o andamento das obras.</p>

          <form onSubmit={login}>

            <label htmlFor="login-cpf">CPF</label>

            <input id="login-cpf" value={cpf} onChange={e => setCpf(fmtCpf(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" autoComplete="username" required />

            <label htmlFor="login-senha">Senha</label>

            <div className="password-field">

              <input id="login-senha" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />

              <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)} aria-label={showPass ? "Ocultar senha" : "Mostrar senha"} title={showPass ? "Ocultar senha" : "Mostrar senha"} aria-pressed={showPass}>

                {showPass ? (

                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="3"/></svg>

                ) : (

                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 6.1A11.6 11.6 0 0 1 12 6c6.5 0 10 6 10 6a15 15 0 0 1-3.2 3.6"/><path d="M6.1 6.1C3.5 8 2 12 2 12s3.5 6 10 6a10 10 0 0 0 4.1-.8"/><path d="M10 10a3 3 0 0 0 4 4"/></svg>

                )}

              </button>

            </div>

            {error && <p className="error" role="alert">{error}</p>}

            <button type="submit" className="primary full">Entrar</button>

          </form>

          <button type="button" className="link-btn" onClick={() => alert("Entre em contato com o administrador do sistema para redefinir sua senha.")}>Esqueci minha senha</button>

          <div className="notice"><span className="notice-icon" aria-hidden="true">ⓘ</span><span><strong>Este acesso é individual. Todas as ações realizadas ficam vinculadas ao vistoriador conectado.</strong></span></div>

        </section>

      </main>

    )}

    {page === "works" && <>

      <header className="figma-topbar">

        <div className="figma-topbar-inner">

          <span className="figma-online" />

          <strong>{current?.name || "Usuário"} ({roleName(session?.role)})</strong>

          <div className="figma-user-menu">

            <button type="button" className="figma-user-button" aria-label="Abrir menu de usuário" onClick={() => setMenu(!menu)}>♙</button>

            {menu && <div className="dropdown figma-dropdown logout-dropdown"><button type="button" className="logout-option" onClick={() => {setMenu(false);setLogoutOpen(true);}}>Sair da conta</button></div>}

          </div>

        </div>

      </header>

      <main className="figma-works-page">

        <h1>Selecionar Obra</h1>

        <p className="figma-subtitle">Escolha a obra em que deseja realizar a vistoria.</p>

        <div className="figma-search-box">

          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>

          <input type="search" aria-label="Buscar obra" placeholder="Buscar obra..." value={workSearch} onChange={e => setWorkSearch(e.target.value)} />

        </div>

        <div className="figma-works-heading"><strong>OBRAS VINCULADAS AO VISTORIADOR</strong><span>{works.length} obras</span></div>

        <div className="figma-work-grid">

          {works.filter(w => `${w.name} ${w.address} ${w.code || ""}`.toLocaleLowerCase("pt-BR").includes(workSearch.toLocaleLowerCase("pt-BR"))).map(w => (

            <article className="figma-work-card" key={w.id}>

              <h2>{w.name}</h2>

              <p className="figma-work-address"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>{w.address}</p>

              <div className="figma-tags"><span className="figma-code">{w.code}</span><span className="figma-running">● Em andamento</span></div>

              <span className="figma-occurrences">{issues.filter(i => i.work === w.name).length} ocorrências</span>

              <div><button type="button" className="figma-access" onClick={() => {setSelectedWork(w);setFilter("Todas");setPage("dashboard");}}>Acessar <span aria-hidden="true">›</span></button></div>

            </article>

          ))}

        </div>

        {works.filter(w => `${w.name} ${w.address} ${w.code || ""}`.toLocaleLowerCase("pt-BR").includes(workSearch.toLocaleLowerCase("pt-BR"))).length === 0 && <p className="figma-empty">Nenhuma obra encontrada.</p>}

      </main>

    </>}

{page === "dashboard" && selectedWork && <>

      <header className="ob-dashboard-header">

        <div className="ob-dashboard-header-inner">

          <div className="ob-dashboard-header-top">

            <span><span className="figma-online" /> {current?.name || "Usuário"} ({roleName(session?.role)})</span>

            <div className="figma-user-menu">

              <button type="button" className="figma-user-button" aria-label="Abrir menu de usuário" onClick={() => setMenu(!menu)}>♙</button>

              {menu && <div className="dropdown figma-dropdown logout-dropdown"><button type="button" className="logout-option" onClick={() => {setMenu(false);setLogoutOpen(true);}}>Sair da conta</button></div>}

            </div>

          </div>

          <button type="button" className="ob-dashboard-back" onClick={() => {setMenu(false);setPage("works");}}>‹ <span>Painel da Obra</span></button>

        </div>

      </header>

      <main className="ob-dashboard-page">

        <section className="ob-dashboard-work">

          <div><h1>{selectedWork.name}</h1><p>♧ {selectedWork.address}</p><small>Última atualização: {myIssues.length ? myIssues[0].date : "Sem registros"}</small></div>

          <span className="figma-running">● Em andamento</span>

        </section>

        <div className="ob-dashboard-metrics">

          <div className="ob-dashboard-metric"><span className="ob-metric-icon blue">▤</span><div><strong>{myIssues.length}</strong><small>Total de ocorrências</small></div></div>

          <div className="ob-dashboard-metric"><span className="ob-metric-icon orange">◉</span><div><strong>{myIssues.filter(i => i.status === "Em análise").length}</strong><small>Em análise</small></div></div>

          <div className="ob-dashboard-metric"><span className="ob-metric-icon red">⚠</span><div><strong>{myIssues.filter(i => i.status === "Pendente").length}</strong><small>Pendentes</small></div></div>

          <div className="ob-dashboard-metric"><span className="ob-metric-icon green">✓</span><div><strong>{myIssues.filter(i => i.status === "Concluída").length}</strong><small>Resolvidas</small></div></div>

        </div>

        <section className="ob-dashboard-progress">

          <div><strong>Progresso da vistoria</strong><b>{myIssues.length ? Math.round(myIssues.filter(i => i.status === "Concluída").length / myIssues.length * 100) : 0}%</b></div>

          <div className="ob-progress-track"><span style={{width: `${myIssues.length ? myIssues.filter(i => i.status === "Concluída").length / myIssues.length * 100 : 0}%`}} /></div>

          <small>{myIssues.filter(i => i.status === "Concluída").length} de {myIssues.length} ocorrências resolvidas</small>

        </section>

        <button type="button" className="ob-dashboard-new" onClick={() => {setForm({title:"",place:"",description:"",severity:"Média"});setEditingIssueId(null);clearPhotos();clearAudio();setStage("form");setPage("newissue");}}>＋ Registrar não-conformidade</button>

        <section className="ob-dashboard-occurrences">

          <div className="ob-occurrences-heading"><strong>OCORRÊNCIAS DA OBRA</strong><span>{myIssues.length} registros</span></div>

          <div className="ob-dashboard-filters">

            {[["Todas",myIssues.length],["Registrada",myIssues.filter(i => i.status === "Registrada").length],["Em análise",myIssues.filter(i => i.status === "Em análise").length],["Pendente",myIssues.filter(i => i.status === "Pendente").length],["Concluída",myIssues.filter(i => i.status === "Concluída").length]].map(([name,count]) => <button key={name} type="button" className={filter === name ? "active" : ""} onClick={() => setFilter(name)}>{name === "Concluída" ? "Resolvidas" : name === "Pendente" ? "Pendentes" : name === "Registrada" ? "Registradas" : name} ({count})</button>)}

          </div>

          <div className="ob-dashboard-issue-grid">

            {myIssues.filter(i => filter === "Todas" || i.status === filter).map(i => <article className="ob-dashboard-issue" key={i.id}>

              <div className="ob-issue-top"><strong>{i.id}</strong><span className={`ob-issue-status ${i.status === "Concluída" ? "done" : i.status === "Em análise" ? "review" : i.status === "Registrada" ? "registered" : "pending"}`}>● {i.status === "Concluída" ? "Resolvida" : i.status}</span></div>

              <h3>{i.title}</h3><div className="ob-issue-meta"><span>Registrada em {i.date}<br />{i.place}</span><span className="ob-issue-category">{i.severity}</span></div>

              <button type="button" className="ob-issue-view" onClick={() => {openIssueDetails(i);}}>Ver ocorrência ›</button>

            </article>)}

          </div>

          {!myIssues.some(i => filter === "Todas" || i.status === filter) && <p className="ob-dashboard-empty">Nenhuma ocorrência nesta categoria.</p>}

        </section>

      </main>

    </>}

    {page === "newissue" && selectedWork && <>

      <header className="ob-dashboard-header">

        <div className="ob-dashboard-header-inner">

          <div className="ob-dashboard-header-top">

            <span><span className="figma-online" /> {current?.name || "Usuário"} ({roleName(session?.role)})</span>

            <div className="figma-user-menu">

              <button type="button" className="figma-user-button" aria-label="Abrir menu de usuário" onClick={() => setMenu(!menu)}>♙</button>

              {menu && <div className="dropdown figma-dropdown logout-dropdown"><button type="button" className="logout-option" onClick={() => { setMenu(false); setLogoutOpen(true); }}>Sair da conta</button></div>}

            </div>

          </div>

          <button type="button" className="ob-dashboard-back" onClick={() => { setMenu(false); setPage("dashboard"); }}>‹ <span>Registrar Ocorrência</span></button>

        </div>

      </header>

      <main className="ob-register-page">

        <section className="ob-register-card">

          <div className="ob-register-steps">

            <span className={stage === "form" ? "active" : "complete"}>1. Registro</span>

            <span className={stage === "review" ? "active" : ""}>2. Revisão</span>

            <span>3. Conclusão</span>

          </div>

          {stage === "form" ? <>

            <div className="ob-register-field"><label htmlFor="ob-work">Obra</label><input id="ob-work" value={selectedWork.name} disabled /></div>

            <div className="ob-register-field"><label htmlFor="ob-title">Título da ocorrência </label><input id="ob-title" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="Ex.: Revestimento com falhas" /></div>

            <div className="ob-register-field"><label htmlFor="ob-place">Local da ocorrência </label><input id="ob-place" value={form.place} onChange={e => setForm({...form,place:e.target.value})} placeholder="Ex.: Torre A, 3º andar, banheiro 02" /></div>

            <div className="ob-register-field"><label htmlFor="ob-description">Descrição do problema </label><textarea id="ob-description" rows={4} value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Descreva o problema identificado..." /></div>

            <div className="ob-register-field"><label htmlFor="ob-severity">Gravidade</label><select id="ob-severity" value={form.severity} onChange={e => setForm({...form,severity:e.target.value})}><option>Baixa</option><option>Média</option><option>Alta</option><option>Crítica</option></select></div>

            <div className="ob-evidence"><h2>Anexar evidências</h2><div className="ob-evidence-grid">

              <label className="ob-evidence-tile"><input type="file" accept="image/*" multiple onChange={choosePhotos} /><span className="ob-evidence-icon">▧</span><strong>Fotos</strong><small>Adicionar fotos</small></label>

              <button type="button" className={`ob-evidence-tile ${audioStatus==="recording"?"recording":""}`} disabled={audioStatus==="processing"} onClick={audioStatus==="recording"?stopAudio:startAudio}>

                <span className="ob-evidence-icon">♩</span>

                <strong>{audioStatus==="recording"?"■ Parar gravação":audioStatus==="processing"?"Preparando áudio...":audioStatus==="ready"?"Gravar novamente":"Áudio (opcional)"}</strong>

                <small>{audioStatus==="recording"?"Gravando... clique para parar":audioStatus==="processing"?"Aguarde um instante":audioStatus==="ready"?"Clique para substituir o áudio":"Clique para gravar áudio"}</small>

              </button>

            </div>{photoNames.length > 0 && <p className="ob-file-names">{photoNames.join(", ")}</p>}

              {audioError && <p className="ob-audio-error" role="alert">{audioError}</p>}

              {audioUrl && <div className="ob-audio-preview"><strong>Ouvir gravação ({Math.round(audioDuration)} s)</strong><audio controls preload="metadata" src={audioUrl} /><button type="button" onClick={clearAudio}>Excluir áudio</button></div>}

              </div>

            <button type="button" className="ob-register-next" onClick={() => {if (audioStatus==="recording" || audioStatus==="processing") { alert("Aguarde a finalização do áudio antes de avançar."); return; } if (!form.title.trim() || !form.place.trim() || !form.description.trim()) { alert("Preencha título, local e descrição."); return; } setStage("review");}}>Avançar para revisão →</button>

            <button type="button" className="ob-register-cancel" onClick={() => {clearPhotos();clearAudio();setPage("dashboard");}}>Cancelar</button>

          </> : <>

            <h2 className="ob-review-title">Revise antes de enviar</h2>

            <div className="ob-review-item"><strong>Obra</strong><span>{selectedWork.name}</span></div>

            <div className="ob-review-item"><strong>Título</strong><span>{form.title}</span></div>

            <div className="ob-review-item"><strong>Local da ocorrência</strong><span>{form.place}</span></div>

            <div className="ob-review-item"><strong>Descrição</strong><span>{form.description}</span></div>

            <div className="ob-review-item"><strong>Gravidade</strong><span>{form.severity}</span></div>

            <div className="ob-review-item ob-review-photos">

              <strong>Fotos selecionadas ({photoPreviews.length})</strong>

              {photoPreviews.length > 0 ? (

                <div className="ob-review-photo-grid">

                  {photoPreviews.map((photo,index) => (

                    <a key={photo.url} href={photo.url} target="_blank" rel="noopener noreferrer" title={`Abrir ${photo.name}`}>

                      <img src={photo.url} alt={`Foto ${index + 1}: ${photo.name}`} />

                    </a>

                  ))}

                </div>

              ) : <span>Nenhuma foto selecionada</span>}

            </div>

              <div className="ob-review-item"><strong>Áudio gravado</strong><span>{audioUrl ? "Sim" : "Não"}</span></div>

            <button type="button" className="ob-register-next" onClick={addIssue}>Confirmar registro</button>

            <button type="button" className="ob-register-cancel" onClick={() => setStage("form")}>Voltar e editar</button>

          </>}

        </section>

      </main>

    </>}

    {page==="success"&&<><Header title="Registro concluído" sub="Não-conformidade registrada"/><main className="container narrow"><section className="success-card"><div className="success-icon">✓</div><h1>Registro realizado!</h1><p className="muted">A não-conformidade foi registrada com sucesso.</p><div className="success-id">{selectedIssue?.id}</div><button className="primary full" onClick={()=>setPage("issue")}>Visualizar registro</button><button className="link-btn" onClick={()=>setPage("dashboard")}>Voltar ao painel da obra</button></section></main></>}

    {page==="issue" && selectedIssue && <>
      <header className="ob-dashboard-header">
        <div className="ob-dashboard-header-inner">
          <div className="ob-dashboard-header-top">
            <span><span className="figma-online" /> {current?.name || "Usuário"} ({roleName(session?.role)})</span>
            <div className="figma-user-menu">
              <button type="button" className="figma-user-button" aria-label="Abrir menu de usuário" onClick={() => setMenu(!menu)}>♙</button>
              {menu && <div className="dropdown figma-dropdown logout-dropdown"><button type="button" className="logout-option" onClick={() => {setMenu(false);setLogoutOpen(true);}}>Sair da conta</button></div>}
            </div>
          </div>
          <button type="button" className="ob-dashboard-back" onClick={() => setPage(session?.role === "manager" ? (selectedWork ? "manager-work" : "manager") : "dashboard")}>‹ <span>Detalhes da Ocorrência</span></button>
        </div>
      </header>
      {session?.role === "manager" ? <main className="gd-page">
        <div className="gd-section-heading"><strong>1. REGISTRO ORIGINAL</strong><span>Somente leitura</span></div>
        <div className="gd-lock">♙ <span>Registro preservado. As informações do vistoriador não podem ser alteradas.</span></div>
        <section className="gd-card gd-original">
          <div className="gd-original-top"><div><small>OCORRÊNCIA</small><strong>{selectedIssue.id}</strong></div><span className={`gd-status ${selectedIssue.status === "Concluída" ? "done" : selectedIssue.status === "Em análise" ? "review" : "pending"}`}>● {selectedIssue.status}</span></div>
          <h1>{selectedIssue.title}</h1>
          <p className="gd-description">{selectedIssue.description || "Nenhuma descrição informada."}</p>
          <div className="gd-original-meta">
            <div><span>Obra</span><strong>{selectedIssue.work}</strong></div>
            <div><span>Registrada por</span><strong>{selectedIssue.inspector || "Vistoriador"}</strong></div>
            <div><span>Data</span><strong>{selectedIssue.date || "Não informada"}</strong></div>
            <div><span>Hora</span><strong>{selectedIssue.time || "Não informada"}</strong></div>
            <div><span>Gravidade</span><strong>{selectedIssue.severity || "Não informada"}</strong></div>
            <div><span>Status original</span><strong>{selectedIssue.originalStatus || "Registrada"}</strong></div>
          </div>
        </section>
        <div className="gd-section-heading"><strong>2. EVIDÊNCIAS E LOCALIZAÇÃO</strong><span>Enviadas pelo vistoriador</span></div>
        <section className="gd-evidence">
          <h2>FOTOS ANEXADAS ({(issueEvidence[selectedIssue.id]?.photos || []).length})</h2>
          {(issueEvidence[selectedIssue.id]?.photos || []).length ? <div className="gd-photos">{issueEvidence[selectedIssue.id].photos.map((photo,index) => <a key={`${photo.url}-${index}`} href={photo.url} target="_blank" rel="noopener noreferrer"><img src={photo.url} alt={`Evidência ${index + 1} da ocorrência`} /></a>)}</div> : <div className="gd-empty">Nenhuma foto anexada a esta ocorrência. As imagens ilustrativas do protótipo não substituem evidências reais.</div>}
          <h2>ÁUDIO GRAVADO</h2>
          <div className="gd-audio">{issueEvidence[selectedIssue.id]?.audio ? <audio controls preload="metadata" src={issueEvidence[selectedIssue.id].audio} /> : <span>Nenhum áudio gravado pelo vistoriador.</span>}</div>
          <h2>LOCALIZAÇÃO</h2>
          <div className="gd-location"><span className="gd-pin">♧</span><div><strong>{selectedIssue.place || "Local não informado"}</strong><small>{selectedWork?.address || selectedIssue.work}</small></div></div>
        </section>
        <div className="gd-section-heading"><strong>3. ANÁLISE DO GESTOR</strong><span>Informação adicional</span></div>
        <section className="gd-analysis">
          <div className="gd-analysis-info">♧ <span>Sua análise será adicionada ao registro, sem alterar os dados originais.</span></div>
          <label htmlFor="gd-status">Status da análise</label>
          <select id="gd-status" value={managerDraftStatus} onChange={e => {setManagerDraftStatus(e.target.value);setManagerSaveMessage("");}}>
            <option value="Registrada">Registrada</option><option value="Em análise">Em análise</option><option value="Pendente">Pendente</option><option value="Concluída">Concluída</option>
          </select>
          <label htmlFor="gd-note">Observação do gestor</label>
          <textarea id="gd-note" rows={4} value={managerDraftNote} onChange={e => {setManagerDraftNote(e.target.value);setManagerSaveMessage("");}} placeholder="Descreva sua análise e as providências necessárias..." />
          <button type="button" className="gd-save" onClick={saveManagerAnalysis}>Salvar análise</button>
          {managerSaveMessage && <p className="gd-feedback" role="status">{managerSaveMessage}</p>}
        </section>
        <div className="gd-section-heading"><strong>4. HISTÓRICO DA OCORRÊNCIA</strong><span>{1+(selectedIssue.history||[]).length} {(selectedIssue.history||[]).length ? "ações" : "ação"}</span></div>
        <section className="gd-card gd-history">
          <div className="gd-history-item"><span className="gd-history-icon blue">▤</span><div><strong>Ocorrência registrada</strong><small>{selectedIssue.inspector || "Vistoriador"} · {selectedIssue.date || "Data não informada"}{selectedIssue.time ? `, ${selectedIssue.time}` : ""}</small><p>Registro original criado com as informações e evidências da vistoria.</p></div></div>
          {(selectedIssue.history||[]).map(action => <div className="gd-history-item" key={action.id}><span className="gd-history-icon orange">◉</span><div><strong>Análise do gestor salva</strong><small>{action.actor} · {action.date}, {action.time}</small><p>Status: {action.fromStatus} → {action.toStatus}</p>{action.note && <p>{action.note}</p>}</div></div>)}
        </section>
        <button type="button" className="gd-return" onClick={() => setPage(selectedWork ? "manager-work" : "manager")}>‹ Voltar ao Dashboard da Obra</button>
        <p className="gd-footnote">Fotos e áudio permanecem disponíveis nesta sessão; para mantê-los após recarregar a página será necessária a integração de armazenamento.</p>
      </main> : <main className="ob-detail-page">
        <section className="ob-detail-card ob-detail-protocol"><div><small>PROTOCOLO DO SISTEMA</small><strong>{selectedIssue.id}</strong></div><span className={`ob-detail-status ${selectedIssue.status === "Concluída" ? "done" : ""}`}>{selectedIssue.status}</span></section>
        <section className="ob-detail-card ob-detail-info"><small>INFORMAÇÕES DA OCORRÊNCIA</small><h1>{selectedIssue.title}</h1><p className="ob-detail-work">{selectedIssue.work}</p><div className="ob-detail-facts"><p><strong>Local da ocorrência</strong><span>{selectedIssue.place || "Não informado"}</span></p><p><strong>Gravidade</strong><span>{selectedIssue.severity || "Não informada"}</span></p></div></section>
        <section className="ob-detail-section"><h2>DESCRIÇÃO COMPLETA</h2><div className="ob-detail-card ob-detail-description">{selectedIssue.description || "Nenhuma descrição informada."}</div></section>
        <section className="ob-detail-section"><h2>FOTOS ANEXADAS ({(issueEvidence[selectedIssue.id]?.photos || []).length})</h2>{(issueEvidence[selectedIssue.id]?.photos || []).length ? <div className="ob-detail-photos">{issueEvidence[selectedIssue.id].photos.map((photo,index) => <a key={`${photo.url}-${index}`} href={photo.url} target="_blank" rel="noopener noreferrer"><img src={photo.url} alt={`Foto ${index+1} da ocorrência`} /></a>)}</div> : <div className="ob-detail-card ob-detail-empty">Nenhuma foto anexada a esta ocorrência.</div>}</section>
        <section className="ob-detail-section"><h2>ÁUDIO GRAVADO</h2><div className="ob-detail-card ob-detail-audio">{issueEvidence[selectedIssue.id]?.audio ? <audio controls preload="metadata" src={issueEvidence[selectedIssue.id].audio} /> : <span>Nenhum áudio gravado</span>}</div></section>
        <section className="ob-detail-section"><h2>METADADOS</h2><div className="ob-detail-card ob-detail-metadata"><p><span>Data</span><strong>{selectedIssue.date}</strong></p><p><span>Horário</span><strong>{selectedIssue.time || "Não registrado"}</strong></p><p><span>Vistoriador</span><strong>{selectedIssue.inspector || "Não informado"}</strong></p></div></section>
        {session?.role === "inspector" && <button type="button" className="ob-detail-edit" onClick={editIssue}>Editar registro</button>}
        <button type="button" className="ob-detail-back" onClick={() => setPage("dashboard")}>Voltar</button>
        <p className="ob-detail-note">Fotos e áudios ficam disponíveis nesta sessão. Após atualizar a página, será necessário integrar o armazenamento ao backend.</p>
      </main>}
    </>}

    {page==="manager"&&(()=>{
      const getStatus=w=>w.progress>=100?"Finalizada":w.progress>=80&&w.pending>0?"Com pendências":"Em andamento";
      const running=works.filter(w=>getStatus(w)==="Em andamento").length;
      const withPending=works.filter(w=>getStatus(w)==="Com pendências").length;
      const finished=works.filter(w=>getStatus(w)==="Finalizada").length;
      const shown=works.filter(w=>managerFilter==="Todas"||getStatus(w)===(managerFilter==="Finalizadas"?"Finalizada":managerFilter));
      const total=works.length||1;
      return <>
        <header className="mg-header"><div className="mg-header-inner">
          <div className="mg-header-top"><span><i className="mg-online"/> {current?.name||"Gestora"} ({roleName(session?.role)})</span>
            <div className="figma-user-menu"><button type="button" className="figma-user-button" aria-label="Abrir menu de usuário" onClick={()=>setMenu(!menu)}>♙</button>
              {menu&&<div className="dropdown figma-dropdown logout-dropdown"><button type="button" className="logout-option" onClick={()=>{setMenu(false);setLogoutOpen(true)}}>Sair da conta</button></div>}
            </div>
          </div><h2>Visão geral das obras</h2>
        </div></header>
        <main className="mg-page">
          <h1>Dashboard Geral</h1><p className="mg-subtitle">Acompanhe o andamento, as ocorrências e os pontos de atenção de todas as obras.</p>
          <div className="mg-section-label"><strong>OBRAS</strong><span>{works.length} no total</span></div>
          <section className="mg-summary">
            <div className="mg-donut" style={{background:`conic-gradient(#188b43 0 ${running/total*100}%, #d32e35 ${running/total*100}% ${(running+withPending)/total*100}%, #888e94 ${(running+withPending)/total*100}% 100%)`}}><div><strong>{works.length}</strong><small>Obras</small></div></div>
            <div className="mg-legend">
              <div><span><i className="mg-dot green"/>Em andamento</span><strong>{running}</strong></div>
              <div><span><i className="mg-dot red"/>Pendentes</span><strong>{withPending}</strong></div>
              <div><span><i className="mg-dot gray"/>Finalizadas</span><strong>{finished}</strong></div>
            </div>
          </section>
          <div className="mg-kpis">
            <div className="mg-kpi"><span>▤</span><div><strong>{works.length}</strong><small>Total de obras</small></div></div>
            <div className="mg-kpi"><span>♙</span><div><strong>{running}</strong><small>Em andamento</small></div></div>
            <div className="mg-kpi"><span>◎</span><div><strong>{finished}</strong><small>Finalizadas</small></div></div>
            <div className="mg-kpi"><span>⚠</span><div><strong>{withPending}</strong><small>Com pendências</small></div></div>
          </div>
          <div className="mg-filters">{["Todas","Em andamento","Finalizadas","Com pendências"].map(f=><button type="button" key={f} className={managerFilter===f?"active":""} onClick={()=>setManagerFilter(f)}>{f}</button>)}</div>
          <div className="mg-section-label mg-work-label"><strong>TODAS AS OBRAS</strong><span>{shown.length} {shown.length===1?"obra":"obras"}</span></div>
          <div className="mg-work-grid">{shown.map(w=>{
            const wi=issues.filter(i=>i.work===w.name);
            const pending=wi.filter(i=>i.status==="Pendente"||i.status==="Registrada").length;
            const status=getStatus(w);
            return <article className="mg-work-card" key={w.id}>
              <div className="mg-work-top"><h3>{w.name}</h3><span className={`mg-work-status ${status==="Finalizada"?"finished":status==="Com pendências"?"pending":"running"}`}>● {status}</span></div>
              <p className="mg-location">♧ {w.address}</p>
              <div className="mg-progress-caption"><span>Progresso da obra</span><b>{w.progress}%</b></div>
              <div className="mg-progress"><span style={{width:`${w.progress}%`}}/></div>
              <div className="mg-work-stats"><div><strong>{wi.length}</strong><small>ocorrências</small></div><div className={pending===0?"none":"has"}><strong>{pending}</strong><small>pendências</small></div></div>
              <div className="mg-work-bottom"><small>{wi.length?`Atualizada em ${wi[0].date}`:"Sem ocorrências registradas"}</small><button type="button" onClick={()=>{setSelectedWork(w);setFilter("Todas");setPage("manager-work")}}>Ver obra <span>›</span></button></div>
            </article>
          })}</div>
          {shown.length===0&&<p className="mg-empty">Nenhuma obra encontrada neste filtro.</p>}
          <section className="mg-recent"><h2>Últimas ocorrências</h2><p>Registros recentes</p>{issueRows(issues.slice(0,5))}</section>
        </main>
      </>;
    })()}

    {page==="manager-work" && selectedWork && (() => {
      const workIssues = issues.filter(i => i.work === selectedWork.name);
      const countReview = workIssues.filter(i => i.status === "Em análise").length;
      const countPending = workIssues.filter(i => i.status === "Pendente" || i.status === "Registrada").length;
      const countDone = workIssues.filter(i => i.status === "Concluída").length;
      const countOther = Math.max(0, workIssues.length - countReview - countPending - countDone);
      const countTotal = workIssues.length;
      const chartTotal = countTotal || 1;
      const pctReview = countReview / chartTotal * 100;
      const pctPending = countPending / chartTotal * 100;
      const pctDone = countDone / chartTotal * 100;
      const latest = [...workIssues].sort((a,b) => {
        const dateValue = d => { const [day,month,year] = (d || "").split("/").map(Number); return year * 10000 + month * 100 + day || 0; };
        return dateValue(b.date) - dateValue(a.date);
      });
      const attention = latest.filter(i => i.status === "Pendente" || i.status === "Registrada");
      const visible = latest.filter(i => filter === "Todas" || (filter === "Pendentes" ? ["Pendente","Registrada"].includes(i.status) : filter === "Resolvidas" ? i.status === "Concluída" : i.status === filter));
      const workStatus = selectedWork.progress >= 100 ? "Finalizada" : selectedWork.progress >= 80 && selectedWork.pending > 0 ? "Com pendências" : "Em andamento";
      const statusClass = st => st === "Concluída" ? "done" : st === "Em análise" ? "review" : st === "Registrada" ? "registered" : "pending";
      const openIssue = issue => openIssueDetails(issue);
      return <>
        <header className="mw-header">
          <div className="mw-header-inner">
            <div className="mw-header-user">
              <span><i className="mg-online" /> {current?.name || "Gestora"} ({roleName(session?.role)})</span>
              <div className="figma-user-menu">
                <button type="button" className="figma-user-button" aria-label="Abrir menu de usuário" onClick={() => setMenu(!menu)}>♙</button>
                {menu && <div className="dropdown figma-dropdown logout-dropdown"><button type="button" className="logout-option" onClick={() => {setMenu(false);setLogoutOpen(true);}}>Sair da conta</button></div>}
              </div>
            </div>
            <button type="button" className="mw-header-back" onClick={() => {setSelectedWork(null);setMenu(false);setPage("manager");}}>‹ <span>Dashboard da Obra</span></button>
          </div>
        </header>
        <main className="mw-page">
          <section className="mw-work-hero">
            <div><h1>{selectedWork.name}</h1><p>♧ {selectedWork.address}</p><small>Última atualização: {latest[0]?.date || "Sem registros"}</small></div>
            <span className={`mw-work-badge ${workStatus === "Finalizada" ? "done" : workStatus === "Com pendências" ? "pending" : "running"}`}>● {workStatus}</span>
          </section>
          <section className="mw-metrics" aria-label="Resumo de ocorrências">
            {[{label:"Ocorrências",value:countTotal,icon:"▤",kind:"blue"},{label:"Em análise",value:countReview,icon:"◉",kind:"orange"},{label:"Pendentes",value:countPending,icon:"⚠",kind:"red"},{label:"Resolvidas",value:countDone,icon:"✓",kind:"green"}].map(item =>
              <div className="mw-metric" key={item.label}><span className={`mw-metric-icon ${item.kind}`}>{item.icon}</span><div><strong>{item.value}</strong><small>{item.label}</small></div></div>
            )}
          </section>
          <div className="mw-section-heading"><strong>OCORRÊNCIAS POR STATUS</strong><span>{countTotal} no total</span></div>
          <section className="mw-status-summary" aria-label="Ocorrências por status">
            <div className="mw-donut" style={{background:countTotal ? `conic-gradient(#f97316 0 ${pctReview}%, #dc3030 ${pctReview}% ${pctReview+pctPending}%, #159447 ${pctReview+pctPending}% ${pctReview+pctPending+pctDone}%, #9aa5b1 ${pctReview+pctPending+pctDone}% 100%)` : "#e5e7eb"}}><div><strong>{countTotal}</strong><small>Ocorrências</small></div></div>
            <div className="mw-legend">
              {[{label:"Em análise",value:countReview,color:"orange"},{label:"Pendentes",value:countPending,color:"red"},{label:"Resolvidas",value:countDone,color:"green"},...(countOther ? [{label:"Outras",value:countOther,color:"gray"}] : [])].map(item =>
                <div key={item.label}><span><i className={`mw-legend-dot ${item.color}`} />{item.label}</span><b>{item.value}</b></div>
              )}
            </div>
          </section>
          {attention.length > 0 && <section className="mw-attention">
            <h2>⚠ Pendências que precisam de atenção</h2>
            <p>{attention.length} {attention.length === 1 ? "ocorrência aguarda" : "ocorrências aguardam"} análise ou resolução.</p>
            <div className="mw-attention-list">{attention.slice(0,3).map(i =>
              <article className="mw-attention-item" key={i.id}>
                <div className="mw-attention-top"><span>{i.id}</span><small>{i.severity === "Alta" || i.severity === "Crítica" ? "Alta prioridade" : "Requer análise"}</small></div>
                <h3>{i.title}</h3>
                <div className="mw-attention-bottom"><small>Registrada em {i.date}</small><button type="button" onClick={() => openIssue(i)}>Revisar agora</button></div>
              </article>
            )}</div>
          </section>}
          <section className="mw-recent">
            <div className="mw-section-heading"><strong>OCORRÊNCIAS RECENTES</strong><span>Lista de Ocorrências</span></div>
            <div className="mw-filters">
              {[{name:"Todas",count:countTotal},{name:"Em análise",count:countReview},{name:"Pendentes",count:countPending},{name:"Resolvidas",count:countDone}].map(f =>
                <button key={f.name} type="button" className={filter === f.name ? "active" : ""} onClick={() => setFilter(f.name)}>{f.name} ({f.count})</button>
              )}
            </div>
            <div className="mw-issue-grid">{visible.map(i =>
              <article className="mw-issue-card" key={i.id}>
                <div className="mw-issue-top"><strong>{i.id}</strong><span className={`mw-issue-status ${statusClass(i.status)}`}>● {i.status === "Concluída" ? "Resolvida" : i.status}</span></div>
                <h3>{i.title}</h3>
                <div className="mw-issue-meta"><span>{i.inspector || "Vistoriador"} · {i.date}{i.time ? ` · ${i.time}` : ""}</span><span className="mw-severity">{i.severity || "Não informada"}</span></div>
                <button type="button" className="mw-view-issue" onClick={() => openIssue(i)}>Ver detalhes ›</button>
              </article>
            )}</div>
            {visible.length === 0 && <p className="mw-empty">Nenhuma ocorrência neste filtro.</p>}
          </section>
        </main>
      </>;
    })()}

    {page==="admin"&&<>
      <header className="adm-topbar">
        <div className="adm-topbar-inner">
          <div className="adm-topbar-user">
            <span className="figma-online" aria-hidden="true"/>
            <strong>{current?.name || "Administrador Superior"} ({roleName(session?.role)})</strong>
            <div className="figma-user-menu">
              <button type="button" className="figma-user-button" aria-label="Abrir menu do usuário" onClick={()=>setMenu(!menu)}>♙</button>
              {menu&&<div className="dropdown figma-dropdown logout-dropdown"><button type="button" className="logout-option" onClick={()=>{setMenu(false);setLogoutOpen(true)}}>Sair da conta</button></div>}
            </div>
          </div>
          <h2>Gestão de Usuários</h2>
        </div>
      </header>
      <main className="adm-page">
        <div className="adm-intro"><div><h1>Gestão de Usuários</h1><p>Cadastre e gerencie os acessos do sistema.</p></div></div>
        <section className="adm-form-card">
          <h2>{editing?"Editar usuário":"Cadastrar usuário"}</h2>
          <form onSubmit={saveUser}>
            <div className="adm-fields">
              <div><label htmlFor="adm-name">Nome completo</label><input id="adm-name" value={userForm.name} onChange={e=>setUserForm({...userForm,name:e.target.value})} required placeholder="Digite o nome completo"/></div>
              <div><label htmlFor="adm-cpf">CPF</label><input id="adm-cpf" value={userForm.cpf} onChange={e=>setUserForm({...userForm,cpf:fmtCpf(e.target.value)})} required placeholder="000.000.000-00" inputMode="numeric"/></div>
              <div><label htmlFor="adm-password">Senha</label><input id="adm-password" type="password" value={userForm.password} onChange={e=>setUserForm({...userForm,password:e.target.value})} required placeholder="Defina uma senha"/></div>
              <div><label htmlFor="adm-role">Perfil</label><select id="adm-role" value={userForm.role} onChange={e=>setUserForm({...userForm,role:e.target.value})}><option value="inspector">Vistoriador</option><option value="manager">Gestor</option></select></div>
            </div>
            <div className="adm-form-actions">{editing&&<button type="button" className="adm-cancel" onClick={()=>{setEditing(null);setUserForm({name:"",cpf:"",password:"",role:"inspector"})}}>Cancelar</button>}<button type="submit" className="adm-submit">{editing?"Salvar alterações":"Cadastrar usuário"}</button></div>
          </form>
        </section>
        <div className="adm-list-heading"><strong>USUÁRIOS CADASTRADOS</strong><span>{users.length} usuários</span></div>
        <section className="adm-user-grid">
          {users.map(u=><article className="adm-user-card" key={u.id}>
            <div className="adm-user-top"><span className="adm-avatar">{u.name.charAt(0).toUpperCase()}</span><div className="adm-user-identity"><strong>{u.name}</strong><small>{fmtCpf(u.cpf)}</small></div><span className={`adm-active ${u.active?"":"inactive"}`}>{u.active?"Ativo":"Inativo"}</span></div>
            <span className="adm-role">{roleName(u.role)}</span>
            {u.role==="admin"?<p className="adm-protected">Conta atual — perfil protegido</p>:<div className="adm-user-actions"><button type="button" onClick={()=>startEdit(u)}>Editar</button><button type="button" className="adm-toggle" onClick={()=>setUsers(prev=>prev.map(x=>x.id===u.id?{...x,active:!x.active}:x))}>{u.active?"Desativar":"Ativar"}</button></div>}
          </article>)}
        </section>
      </main>
    </>}

    {logoutOpen&&<div className="modal-backdrop" onClick={()=>setLogoutOpen(false)}><section className="modal" onClick={e=>e.stopPropagation()}><div className="modal-icon">↪</div><h2>Sair da conta?</h2><p className="muted">Tem certeza que deseja sair da sua conta?</p><div className="button-row"><button className="secondary" onClick={()=>setLogoutOpen(false)}>Cancelar</button><button className="primary" onClick={logout}>Sair</button></div></section></div>}

  </div>;

}

function Metric({label,value,icon}){return <div className="metric"><span className="metric-icon">{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>}

export default App;
