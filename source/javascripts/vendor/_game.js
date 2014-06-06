var i, j, I_Sel, J_Sel, DMove, MaxMove=480, MaxMoveLine=32, NDraw, IsOver, CanJump;
var MoveCount, MaxMoveCount, NLine, NCLine, MaxFld=17, Start=0, NPlayer=2, Msg=0;

MoveLine = new Array(MaxMoveLine);
for (i=0; i<MaxMoveLine; i++) MoveLine[i] = new Array(2);

MoveCLine = new Array(MaxMoveLine);
for (i=0; i<MaxMoveLine; i++) MoveCLine[i] = new Array(2);

Fld = new Array(MaxFld);
for (i=0; i < MaxFld; i++) Fld[i]=new Array(MaxFld);

FldH = new Array(MaxMove+7);
for (i=0; i<MaxMove+7; i++) FldH[i] = new Array(4);

IsPlayer=new Array(1,0,1,0,1,0);
IsPlaying=new Array(1,0,0,1,0,0);
Level=new Array(1,0,0,2,0,0);
CanMove=new Array(6);
DirX=new Array(1, 0,-1,-1, 0, 1);
DirY=new Array(0, 1, 1, 0,-1,-1);
GoalX=new Array(12,16,12, 4, 0, 4);
GoalY=new Array( 0, 4,12,16,12, 4);

Pic= new Array(7);
for (i=0; i<7; i++) Pic[i]= new Array(2);
for (i=0; i<7; i++)
{ for (j=0; j<2; j++)
  { Pic[i][j] = new Image();
    Pic[i][j].src = "chinesecheckers"+i+""+j+".gif";
  }  
}

function SetPlayer(ii,nn)
{ IsPlayer[ii]=parseInt(nn);
  if (Level[ii]>0) Level[ii]=2-IsPlayer[ii];
}

function SetPlaying(ii,nn)
{ if(nn) IsPlaying[ii]=1;
  else IsPlaying[ii]=0;
}

function SetStart(ss)
{ Start=ss;
}

function FldVal(ii,jj)
{ var vv=-1;
  if ((4<=ii)&&(ii<=12)&&(4<=jj)&&(jj<=12))
  { if (ii+jj<12) return(6);
    if (ii+jj>20) return(3);
    return(0);
  }
  if ((ii<=12)&&(jj<4)&&(ii+jj>=12)) return(1);
  if ((ii>12)&&(jj>=4)&&(ii+jj<=20)) return(2);
  if ((ii>=4)&&(jj>12)&&(ii+jj<=20)) return(4);
  if ((ii<4)&&(jj<=12)&&(ii+jj>=12)) return(5);
  return(-1);
}

function Init()
{ var ii, jj, vv;
  for (jj=0; jj<MaxFld; jj++)
  { for (ii=0; ii<MaxFld; ii++)
    { vv=FldVal(ii,jj);
      if (vv<1) Fld[ii][jj]=vv;
      else Fld[ii][jj]=((vv+2)%6+1)*IsPlaying[(vv+2)%6];
    }  
  }
  for (ii=0; ii<6; ii++) Level[ii]=IsPlaying[ii]*(2-IsPlayer[ii]);
  IsOver=false;
  NLine=0;
  NCLine=0;
  CanJump=true;
  MoveCount=0;
  MaxMoveCount=0;
  I_Sel=-1; 
  J_Sel=-1;
  DMove=Start;
  NDraw=0;
  NPlayer=0;
  for (ii=0; ii<6; ii++)
  { if (Level[ii]>0) NPlayer++;
  }
  for (ii=0; ii<6; ii++) CanMove[ii]=1;
  RefreshScreen();  
}

function Timer()
{ if (NDraw>0) { RefreshScreen(); return; }
  if (Msg>0) ShowMsg(); 
  else MakeBestMove();
}

function MakeBestMove()
{ var ii, jj, iid, jjd, iik, jjk, kk, dd, mm, nn, iis, jjs, ddir, dd0;
  var iib, jjb, bb, bb2, bbval=-1000, pparity=0, iismm, cc0, cc1;
  if (IsOver) return;
  if (IsPlayer[DMove]) return;
  kk=DMove+1;
  I_Sel=-1;
  J_Sel=-1;
  NCLine=0;
  if (DMove%3==0)
  { for (ii=0; ii<MaxFld; ii++)
    { for (jj=0; jj<MaxFld; jj++)
      { if (Fld[ii][jj]==kk) pparity+=4*ii+2*jj-48;
      }
    }
  }
  if (DMove%3==1)
  { for (ii=0; ii<MaxFld; ii++)
    { for (jj=0; jj<MaxFld; jj++)
      { if (Fld[ii][jj]==kk) pparity+=4*jj+2*ii-48;
      }
    }
  }
  if (DMove%3==2)
  { for (ii=0; ii<MaxFld; ii++)
    { for (jj=0; jj<MaxFld; jj++)
      { if (Fld[ii][jj]==kk) pparity+=3*ii-3*jj;
      }
    }
  }    
  for (ii=0; ii<MaxFld; ii++)
  { for (jj=0; jj<MaxFld; jj++)
    { if (Fld[ii][jj]==kk)
      { <!-- setting all reachable fields to -3 -->
        Fld[ii][jj]=-2;
        FindJumpFields(kk);
        Fld[ii][jj]=kk;
        for (ddir=0; ddir<6; ddir++)   <!-- FindStepFields -->
        { iik=ii+DirX[ddir];
          jjk=jj+DirY[ddir];
          if (IsInField(iik, jjk))
          { if (Fld[iik][jjk]==0) Fld[iik][jjk]=-2;
          }
        }
        <!-- getting best move for Field[ii][jj]   Be carefull with the weights ! -->
        cc0=CenterDistance(ii, jj);
        dd0=GoalDistance(ii, jj);
        for (iik=0; iik<MaxFld; iik++)
        { for (jjk=0; jjk<MaxFld; jjk++)
          { if (Fld[iik][jjk]<-1)
            { cc1=CenterDistance(iik,jjk);
              bb=24*dd0
                -18*GoalDistance(iik,jjk)
                +Math.abs(cc0)
                -Math.abs(cc1)
                -Math.abs(pparity-cc0+cc1)
                +Math.random(); 
              if (MoveCount<NPlayer) bb+=Math.random()*8000;
              if (bb>bbval)
              { I_Sel=ii;
                J_Sel=jj;
                iib=iik;
                jjb=jjk;
                bbval=bb;
              }
            }
          }
        }
        CleanUpFields();
      }
    }
  }
  Fld[I_Sel][J_Sel]=-2; <!-- All the following stuff is only for getting MoveCLine for the graphics -->
  FindJumpFields(kk);
  for (ddir=0; ddir<6; ddir++)
  { iik=I_Sel+DirX[ddir];
    jjk=J_Sel+DirY[ddir];
    if (IsInField(iik, jjk))
    { if (Fld[iik][jjk]<-1) Fld[iik][jjk]=-3;
    }
  }
  mm=Fld[iib][jjb];
  iismm=false;
  NCLine=1;
  MoveCLine[NCLine-1][0]=iib;
  MoveCLine[NCLine-1][1]=jjb;
  while (mm<-3)
  { iik=MoveCLine[NCLine-1][0];
    jjk=MoveCLine[NCLine-1][1];
    
    for (ddir=0; ddir<6; ddir++)
    { if (!iismm)
      { iid=DirX[ddir];
        jjd=DirY[ddir];
        if (IsInField(iik+iid, jjk+jjd)&&(IsInField(iik+2*iid, jjk+2*jjd)))
        { if ((Fld[iik+iid][jjk+jjd]>0)&&(Fld[iik+2*iid][jjk+2*jjd]==mm+1)) 
          { iismm=true;
            NCLine++;
            MoveCLine[NCLine-1][0]=iik+2*iid;
            MoveCLine[NCLine-1][1]=jjk+2*jjd;
          }
        }
      }
    }
    mm++;
    iismm=false;
  }
  NCLine++;
  MoveCLine[NCLine-1][0]=I_Sel;
  MoveCLine[NCLine-1][1]=J_Sel;
  Fld[I_Sel][J_Sel]=kk;
  CleanUpFields();
  NDraw=NCLine+1;
  MakeMove(iib, jjb);
}

function FindJumpFields(kk)
{ var iid, jjd, iik, jjk, dd, mm, nn, iis, jjs, cc, ddir;
  mm=-2;
  do
  { cc=false;
    for (iik=0; iik<MaxFld; iik++)
    { for (jjk=0; jjk<MaxFld; jjk++)
      { if (Fld[iik][jjk]==mm)
        { for (ddir=0; ddir<6; ddir++)
          { iid=DirX[ddir];
            jjd=DirY[ddir];
            if (IsInField(iik+iid, jjk+jjd)&&(IsInField(iik+2*iid, jjk+2*jjd)))
            { if ((Fld[iik+iid][jjk+jjd]>0)&&(Fld[iik+2*iid][jjk+2*jjd]==0)) 
              { Fld[iik+2*iid][jjk+2*jjd]=mm-1;
                cc=true;
              }  
            }
          }
        }
      }
    }
    mm--;
  }
  while (cc);
  return(mm);
}

function CleanUpFields()
{ var iik, jjk;
  for (iik=0; iik<MaxFld; iik++)
  { for (jjk=0; jjk<MaxFld; jjk++)
    { if (Fld[iik][jjk]<-1) Fld[iik][jjk]=0;
    }
  }
}

function IsInField(ii, jj)
{ if (ii<0) return(false);
  if (ii>=MaxFld) return(false);
  if (jj<0) return(false);
  if (jj>=MaxFld) return(false);
  if (Fld[ii][jj]==-1) return(false);
  return(true);
}

function GoalDistance(ii, jj)
{ var ddi=GoalX[DMove]-ii;
  var ddj=GoalY[DMove]-jj;
  if (ddi*ddj<0)
  { if (Math.abs(ddi)>Math.abs(ddj)) return(Math.abs(ddi));
    return(Math.abs(ddj));
  }
  return(Math.abs(ddi)+Math.abs(ddj));
}

function CenterDistance(ii, jj)
{ if (DMove%3==0) return(4*ii+2*jj-48);
  if (DMove%3==1) return(4*jj+2*ii-48);
  if (DMove%3==2) return(3*ii-3*jj);
  return(0);
}

function MouseDown(ii, jj)
{ if (IsOver) return;
  if (! IsPlayer[DMove]) return;
  if (NDraw>0) return;
  if (Pressed(ii, jj)) RefreshScreen();
  //else alert ("Invalid Move !");
} 

function Pressed(ii, jj)
{ var kk, ddi, ddj, cci, ccj, dd, nn;
  cci=0; ccj=0; nn=0;
  for (kk=0; kk<NLine-1; kk++)
  { if ((MoveLine[kk][0]==ii)&&(MoveLine[kk][1]==jj))
    { if (kk>0) NLine=kk+1;
      else
      { NLine=0;
        I_Sel=-1;
        J_Sel=-1;
      }
      return(true);
    }
  }
  if (NLine==MaxMoveLine) return(false);
  MoveLine[NLine][0]=ii;
  MoveLine[NLine][1]=jj;
  if (NLine==0)
  { if (Fld[ii][jj]!=DMove+1) return(false);
    else
    { NLine++;
      I_Sel=ii;
      J_Sel=jj;
      CanJump=true;
      return(true);
    }
  }
  else
  { if (NLine==1)
    { if ((MoveLine[0][0]==ii)&&(MoveLine[0][1]==jj))
      { NLine=0;
        I_Sel=-1;
        J_Sel=-1;
        return(true);
      }
    }
    if (Fld[ii][jj]!=0) return(false);
  }
  if ((MoveLine[NLine-1][0]==ii)&&(MoveLine[NLine-1][1]==jj))
  { if ((ii!=MoveLine[0][0])|(jj!=MoveLine[0][1])) MakeMove(ii, jj);
    NLine=0;
    return(true);
  }
  ddi=ii-MoveLine[NLine-1][0];
  ddj=jj-MoveLine[NLine-1][1];
  if ((Math.abs(ddi)<2)&&(Math.abs(ddj)<2))
  { if (NLine==1)
    { CanJump=false;
      NLine++;
      if (Math.abs(ddi+ddj)==2) return(false);
      return(true);
    }
    else return(false);
  }
  if (CanJump)
  { if (((ddi!=0)&&(Math.abs(ddi)!=2))||((ddj!=0)&&(Math.abs(ddj)!=2))) return(false);
    if (Math.abs(ddi+ddj)==4) return(false);
    if (Fld[ii-ddi/2][jj-ddj/2]<=0) return(false);
    if ((ii-ddi/2==I_Sel)&&(jj-ddj/2==J_Sel)) return(false);
    NLine++;
    return(true);
  }
  return(false);
}

function Back()
{ if (MoveCount>0)
  { IsOver=false;
    NLine=0;
    NCLine=0;
    MoveCount--;
    DMove=Fld[FldH[MoveCount][2]][FldH[MoveCount][3]]-1;
    CanMove[DMove]=1;
    Fld[FldH[MoveCount][2]][FldH[MoveCount][3]]=0;
    Fld[FldH[MoveCount][0]][FldH[MoveCount][1]]=DMove+1;
    I_Sel=-1;
    J_Sel=-1;
    RefreshScreen();
    window.document.OptionsForm.Start[DMove].checked=true;
  }
}

function AllBack()
{ var dd=DMove;
  do Back();
  while (dd!=DMove);  
}

function Replay()
{ if (MoveCount<MaxMoveCount)
  { I_Sel=FldH[MoveCount][0];
    J_Sel=FldH[MoveCount][1];
    var ii=FldH[MoveCount][2];
    var jj=FldH[MoveCount][3];
    MakeMove(ii, jj);
    NCLine=0;
  }
}

function AllReplay()
{ var dd=DMove;
  do Replay();
  while (dd!=DMove);  
}

function MakeMove(ii, jj)
{ if (IsOver) return;
  Fld[ii][jj]=DMove+1;
  Fld[I_Sel][J_Sel]=0;
  if (FldH[MoveCount][0]!=I_Sel)
  { FldH[MoveCount][0]=I_Sel;
    MaxMoveCount=MoveCount+1;
  }
  if (FldH[MoveCount][1]!=J_Sel)
  { FldH[MoveCount][1]=J_Sel;
    MaxMoveCount=MoveCount+1;
  }
  if (FldH[MoveCount][2]!=ii)
  { FldH[MoveCount][2]=ii;
    MaxMoveCount=MoveCount+1;
  }
  if (FldH[MoveCount][3]!=jj)
  { FldH[MoveCount][3]=jj;
    MaxMoveCount=MoveCount+1;
  }
  MoveCount++;
  if (MaxMoveCount<MoveCount)
    MaxMoveCount=MoveCount;
  I_Sel=-1;
  J_Sel=-1;
  NLine=0;
  RefreshScreen();
  var nn, mm, bb=true;
  for (nn=0; nn<MaxFld; nn++)
  { for (mm=0; mm<MaxFld; mm++)
    { if (Fld[nn][mm]==DMove+1)
      { if (FldVal(nn, mm)!=DMove+1) bb=false;
      }
    }
  }
  if (bb)
  { CanMove[DMove]=0;
    IsOver=true;
    for (nn=0; nn<6; nn++)
    { if (Level[nn]*CanMove[nn]!=0) IsOver=false; }
    if (!IsOver) 
    { if (MoveCount==MaxMove-1)
      { IsOver=true;
        Msg=1;
      }
      else Msg=2; 
    }  
    else 
    { Msg=3;
      return;
    }
  }  
  do DMove=(DMove+1)%6;
  while (Level[DMove]*CanMove[DMove]==0);
  window.document.OptionsForm.Start[DMove].checked=true;
}

function ShowMsg()
{ if (Msg==1) 
  { alert("Sorry, no more moves!"); 
    Msg=0; 
  }
  if (Msg==2) 
  { alert("Well done!"); 
    Msg=0; 
  }
  if (Msg==3)
  { if (confirm("No more moves.\nDo you want to play again?")) 
    { Msg=0; 
      Init();
    }
  }
  Msg=0;  
}

function ImgNum(vvi,vvj)
{ var ii, jj, nn=0;
  for (jj=0; jj < MaxFld; jj++)
  { for (ii=0; ii < MaxFld; ii++)
    { if ((ii==vvi)&&(jj==vvj)) return(nn);
      if (Fld[ii][jj]>=0) nn++;
    }
  }
  return(0);
}

function RefreshScreen()
{ var ii, jj, kk, nn=0;
  if (NDraw>0) NDraw--;
  if (NDraw==0)
  { for (jj=0; jj<MaxFld; jj++)
    { for (ii=0; ii<MaxFld; ii++)
      { if (Fld[ii][jj]>=0)
        { if (window.document.images[nn].src != Pic[Fld[ii][jj]][0].src)
            window.document.images[nn].src = Pic[Fld[ii][jj]][0].src;
          nn++;
        }    
      }
    }
  }
  for (kk=0; kk<NLine-1; kk++)
  { ii=MoveLine[kk][0];
    jj=MoveLine[kk][1];
    nn=ImgNum(ii,jj);
    if (window.document.images[nn].src != Pic[0][1].src)
      window.document.images[nn].src = Pic[0][1].src;
  }
  if (NLine>0)
  { ii=MoveLine[NLine-1][0];
    jj=MoveLine[NLine-1][1];
    nn=ImgNum(ii,jj);
    if (window.document.images[nn].src != Pic[Fld[I_Sel][J_Sel]][1].src)
      window.document.images[nn].src = Pic[Fld[I_Sel][J_Sel]][1].src;
  }
  if (NDraw>0)
  { for (kk=NDraw-1; kk<NCLine; kk++)
    { ii=MoveCLine[kk][0];
      jj=MoveCLine[kk][1];
      nn=ImgNum(ii,jj);
      if (window.document.images[nn].src != Pic[0][1].src)
        window.document.images[nn].src = Pic[0][1].src;
    }
    ii=MoveCLine[NDraw-1][0];
    jj=MoveCLine[NDraw-1][1];
    nn=ImgNum(ii,jj);
    kk=Fld[MoveCLine[0][0]][MoveCLine[0][1]];
    if (NDraw>0)
      window.document.images[nn].src = Pic[kk][1].src;
    else
      window.document.images[nn].src = Pic[kk][0].src;
  }  
  if (MoveCount>99) window.document.OptionsForm.Moves.value=MoveCount;
  else
  { if (MoveCount>9) window.document.OptionsForm.Moves.value=" "+MoveCount+" ";
    else window.document.OptionsForm.Moves.value="  "+MoveCount+"  ";
  }  
}

function Help()
{ alert("Chinese Checkers is a well-known game for kids."+
      "\nClick on a piece to select it and after that on a"+
      "\nneighbouring empty field to move, or jump over"+
      "\nneighbouring fields occupied by other pieces."+
      "\nAt the end of a move click on the piece again."+
      "\nThe player who first moves all of his pieces to"+
      "\nthe opposite side is the winner.");
}

function Resize()
{ if(navigator.appName == "Netscape") history.go(0);
}
NDots=new Array(1,2,3,4,13,12,11,10,9,10,11,12,13,4,3,2,1);