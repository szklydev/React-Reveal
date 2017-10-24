/*
 * Flip React Component
 *
 * Copyright © Roman Nosov 2017 
 * CSS Effect - Copyright (c) 2016 Daniel Eden 
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import { bool } from 'prop-types';
import Reveal from '../Reveal';
import { animation } from '../lib/globals';

const
  propTypes = {
    out: bool,
    left: bool,
    right: bool, // y
    top: bool, // x
    bottom: bool,
  },
  defaultProps = {
      
  };

function Flip({ out, left, right, top, bottom, x, y, ...props }, context) {	

  function factory(reverse) {
    
    function make() {
      let rule;
      if (x||y||left||right||top||bottom) {
        const xval = x||top||bottom ? (bottom?'-':'') + '1' : '0', 
              yval = y||right||left ? (left?'-':'') +'1' : '0';
        if (!reverse)
          rule=`from {
              transform: perspective(400px) rotate3d(${xval}, ${yval}, 0, 90deg);
              animation-timing-function: ease-in;
              opacity: 0;
            }
          
            40% {
              transform: perspective(400px) rotate3d(${xval}, ${yval}, 0, -20deg);
              animation-timing-function: ease-in;
            }
          
            60% {
              transform: perspective(400px) rotate3d(${xval}, ${yval}, 0, 10deg);
              opacity: 1;
            }
          
            80% {
              transform: perspective(400px) rotate3d(${xval}, ${yval}, 0, -5deg);
            }
          
            to {
              transform: perspective(400px);
            }`; 
        else 
          rule = `from {
              transform: perspective(400px);
            }
          
            30% {
              transform: perspective(400px) rotate3d(${xval}, ${yval}, 0, -15deg);
              opacity: 1;
            }
          
            to {
              transform: perspective(400px) rotate3d(${xval}, ${yval}, 0, 90deg);
              opacity: 0;
            }`; 
        } else 
          rule = `from {
              transform: perspective(400px) rotate3d(0, 1, 0, -360deg);
              animation-timing-function: ease-out;
              opacity: ${!reverse?'0':'1'};
            }
          
            40% {
              transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -190deg);
              animation-timing-function: ease-out;
            }
          
            50% {
              transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -170deg);
              animation-timing-function: ease-in;
            }
          
            to {
              transform: perspective(400px);
              animation-timing-function: ease-in;
              opacity: ${reverse?'0':'1'};
            }`;
      return(animation(rule));
    }
    
    return { style: { backfaceVisibility: 'visible' },  make }; 
  }
  
  return context
    ? <Reveal {...props} in={factory(false)} out={factory(true)} />
    : factory(out)
  ;
}

Flip.propTypes = propTypes;
Flip.defaultProps = defaultProps;
export default Flip;