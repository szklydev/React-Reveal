/*
 * RevealBase Component For react-reveal
 *
 * Copyright © Roman Nosov 2016, 2017
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import { string, object, number, bool, func, any, oneOfType, oneOf, instanceOf, shape, element } from 'prop-types';
import { namespace, ssr, disableSsr, globalHide, cascade, collapseend, fadeOutEnabled } from './lib/globals';
//import Step from './lib/Step';
import throttle from './lib/throttle';

const
  inOut = shape({
    make: func,
    duration: number.isRequired,
    delay: number.isRequired,
    forever: bool,
    count: number.isRequired,
    style: object.isRequired,
    reverse: bool,
  }),
  propTypes = {
    //when: any,
    //spy: any,
    collapse: bool,//oneOfType([bool, shape({ height: string })]),
    cascade: bool,
    wait: number,
//    step: oneOfType([instanceOf(Step), string]),
    force: bool,
    disabled: bool,
    appear: bool,
    enter: bool,
    exit: bool,
    fraction: number,
    //children: element.isRequired,
    refProp: string,
    innerRef: func,
    onReveal: func,
    //onEnter: func,
    //onEntering: func,
    //onEntered: func,
    //onExit: func,
    //onExiting: func,
    //onExited: func,
    inEffect: inOut.isRequired,
    outEffect: oneOfType([ inOut, oneOf([ false ]) ]).isRequired,
  },
  defaultProps = {
    fraction: 0.2,
    //when: true,
    refProp: 'ref',
  },
  //,
  //contextTypes = {
  //  stepper: object,
  //};

  contextTypes = {
    transitionGroup: object,
  };

  //childContextTypes = {
  //  transitionGroup: ()=>{},
  //};

class RevealBase extends React.Component {

  //getChildContext() {
  //  return { transitionGroup: null }; // allows for nested Transitions
  //}

  constructor(props, context) {
    super(props, context);
    this.isOn = 'when' in props ? !!props.when : true;
    this.state = {
      collapse: props.collapse ? RevealBase.getInitialCollapseStyle(props): void 0,
      style: {
        opacity: !this.isOn && props.outEffect ? 0 : void 0,
      },
    };
    this.savedChild = false;
    this.isListener = false;
    this.isShown = false;
    this.revealHandler = throttle(this.reveal.bind(this, false), 66);
    this.resizeHandler = throttle(this.resize.bind(this), 500);
    this.saveRef = this.saveRef.bind(this);
  }

  static getTop(el) {
    while (el.offsetTop === void 0)
      el = el.parentNode;
    let top = el.offsetTop;
    for (;el.offsetParent; top += el.offsetTop)
      el = el.offsetParent;
    return top;
  }

  saveRef(node) {
    if (this.childRef)
      this.childRef(node);
    if (this.props.innerRef)
      this.props.innerRef(node);
    this.el = node && ('offsetHeight' in node) ? node : undefined;
  }

  inViewport() {
    if (!this.el || window.document.hidden) return false;
    const h = this.el.offsetHeight,
          delta = window.pageYOffset - RevealBase.getTop(this.el),
          tail = Math.min(h, window.innerHeight) * ( globalHide ? this.props.fraction : 0 );
    return ( delta > tail - window.innerHeight ) && ( delta < h - tail );
  }

  hide() {
    if (this.props.outEffect)
      this.setState({ style: { opacity: 0 } });
  }

  resize() {
    if (!this||!this.el||!this.isOn)
      return;
    if ( this.inViewport() ) {
      this.unlisten();
      this.isShown = this.isOn;
      this.setState({ style: { opacity: this.isOn || !this.props.outEffect ? 1 : 0 } });
      this.onReveal(this.props);
      //if (this.props.onReveal && this.isOn)
      //  this.props.wait ? this.onRevealTimeout = window.setTimeout(this.props.onReveal, this.props.wait) : this.props.onReveal();
    }
  }

  invisible() {
    if (!this || !this.el)
      return;
    this.savedChild = false;
    if (!this.isShown) {
      this.setState( { style: { ...this.state.style, visibility: 'hidden' }/*, collapsing: false */});
      if (this.props.collapse)
        window.document.dispatchEvent(collapseend);
    }
    if (this.props.onExited)
      this.props.onExited(this.el);
  }

  animationEnd(func, cascade, { forever, count, delay, duration }) {
    if (forever)
      return;
    //const el = this.finalEl || this.el;
    const handler = () => {
      if (!this || !this.el)
        return;
      this.animationEndTimeout = void 0;
      //el.removeEventListener('animationend', handler);
      func.call(this);
    };
    this.animationEndTimeout = window.setTimeout(handler, delay+(duration+(cascade?duration:0)*count));
    //el.addEventListener('animationend', handler);
    //this.animationEndEl = el;
    //this.animationEndHandler = handler;
  }

  getDimensionValue() {
    return this.el.offsetHeight + parseInt(window.getComputedStyle(this.el, null).getPropertyValue('margin-top'),10) + parseInt(window.getComputedStyle(this.el, null).getPropertyValue('margin-bottom'), 10);
  }
      //    //const delta = this.props.duration>>2,
      //    //      duration = delta,
      //    //      delay = this.props.delay + (this.isOn ? 0 : this.props.duration - delta)

  collapse(props, inOut) {
      const total = inOut.duration + (props.cascade ? inOut.duration : 0),
      //      delta = total>>2,
      //      duration = props.when ? delta : total - delta,
      //      delay = inOut.delay + (props.when ? 0 : delta),
            delta1 = total>>2,
            delta2 = delta1>>1,
            duration = delta1, // + (props.when ? 0 : delta2),
            delay = inOut.delay + (this.isOn ? 0 : total - delta1 - delta2),
            animationDuration = `${total - delta1 + (this.isOn ? delta2 : -delta2)}ms`,
            animationDelay = `${inOut.delay + (this.isOn ? delta1 - delta2 : 0)}ms`,
            height = this.isOn ? this.getDimensionValue() : 0;
            //padding = this.isOn ? ((this.dummyEl&&window.getComputedStyle(this.dummyEl, null).getPropertyValue('padding')) || false) : 0,
            //border = this.isOn ? ((this.dummyEl&&window.getComputedStyle(this.dummyEl, null).getPropertyValue('border')) || false) : 0;
      //if (height !== false)
        return {
            height,
            //padding, border,
            transition: `height ${duration}ms ease ${delay}ms`,// padding ${duration}ms ease ${delay}ms, border ${duration}ms ease ${delay}ms`,
            animationDuration,
            animationDelay,
            //margin: 0, padding: 0, border: '1px solid transparent',
            boxSizing: 'border-box',
            //transition: `height ${duration}ms ease ${delay}ms`,
          //collapsing: true,
        };
  }

  animate(props) {
    if (!this || !this.el)
      return;
    this.unlisten();
    if (this.isShown === this.isOn)
      return;
    this.isShown = this.isOn;
    const leaving = !this.isOn && props.outEffect,
          inOut = props[leaving ? 'outEffect' : 'inEffect'],
          collapse = 'collapse' in props;
    //const inOut = props[this.isOn || !props.outEffectEffect ?'inEffect':'outEffect'];
    let animationName = (('style' in inOut) && inOut.style.animationName) || void 0;
    if ((props.outEffect||this.isOn) && inOut.make)
        animationName = inOut.make();
    this.setState({
      collapse: collapse ? this.collapse(props, inOut) : undefined,
      style: {
        ...inOut.style,
        animationDuration: `${inOut.duration}ms`,
        animationDelay: `${inOut.delay}ms`,
        animationIterationCount: inOut.forever ? 'infinite' : inOut.count,
        opacity: 1,
        //visibility: 'visible',
        animationName,
      },
      className: inOut.className,
    });
    if (leaving) {
      this.savedChild = React.cloneElement(this.getChild());
      this.animationEnd( this.invisible, props.cascade, inOut);
    }
    else
      this.savedChild = false;
      //if (collapse)
      //  this.animationEnd( () => this.setState({ collapse: void 0 }), props.cascade, inOut);
    this.onReveal(props);
  }

  onReveal(props) {
    if (props.onReveal && this.isOn) {
      if (this.onRevealTimeout)
        this.onRevealTimeout = window.clearTimeout(this.onRevealTimeout);
      props.wait ? this.onRevealTimeout = window.setTimeout(props.onReveal, props.wait) : props.onReveal();
    }
  }

  unlisten() {
    if (this.isListener) {
      window.removeEventListener('scroll', this.revealHandler);
      window.removeEventListener('orientationchange', this.revealHandler);
      window.document.removeEventListener('visibilitychange', this.revealHandler);
      window.document.removeEventListener('collapseend', this.revealHandler);
      window.removeEventListener('resize', this.resizeHandler);
      this.isListener = false;
    }
    if(this.onRevealTimeout)
      this.onRevealTimeout = window.clearTimeout(this.onRevealTimeout);
    if (this.animationEndTimeout)
      this.animationEndTimeout = window.clearTimeout(this.animationEndTimeout);
    //if (this.animationEndHandler)
    //   this.animationEndEl.removeEventListener('animationend', this.animationEndHandler);
  }

  componentWillUnmount() {
    this.unlisten();
    ssr && disableSsr();
  }

  listen() {
    if (!this.isListener) {
      this.isListener = true;
      window.addEventListener('scroll', this.revealHandler);
      window.addEventListener('orientationchange', this.revealHandler);
      window.document.addEventListener('visibilitychange', this.revealHandler);
      window.document.addEventListener('collapseend', this.revealHandler);
      window.addEventListener('resize', this.resizeHandler);
    }
  }

  reveal(props) {
    if (!this||!this.el) return;
    if (!props)
      props = this.props;
    if ( this.isOn && this.isShown && 'spy' in props ){
        this.isShown = false;
        this.setState({ style: {} });
        window.setTimeout( () => this.reveal(props), 200 );
    } else if ( this.inViewport() ) {
      //if (this.start) {
      //  this.hide();
      //  this.listen();
      //  this.start(this.step);
      //  return;
      //}
      this.animate(props);
    } else
      this.listen();
  }

  componentDidMount() {
    if (this.props.cascade) console.log('Mount:', this.props);
    if (!this.el || this.props.disabled)
      return;
    const parentGroup = this.context.transitionGroup;
    const appear = parentGroup && !parentGroup.isMounting ? !('enter' in this.props && this.props.enter === false) : this.props.appear;
    if (this.isOn && ((('when' in this.props || 'spy' in this.props) && !appear)
    || (ssr && !fadeOutEnabled && this.props.outEffect && (RevealBase.getTop(this.el) < window.pageYOffset + window.innerHeight)))
      ) {
      this.isShown = true;
      this.setState({
        collapse: this.props.collapse ? {...this.state.collapse, height: this.getDimensionValue()} : this.state.collapse,
        style: { opacity: 1,}
      });
      this.onReveal(this.props);
      return;
    }
    if ( ssr && fadeOutEnabled && this.props.outEffect && (RevealBase.getTop(this.el) < window.pageYOffset + window.innerHeight)) {
      this.setState({ style: { opacity: 0, transition: 'opacity 1000ms 1000ms' } });
      window.setTimeout(this.revealHandler, 2000);
      return;
    }
    if(this.isOn)
      this.props.force ? this.animate(this.props) : this.reveal(this.props);
    //  return this.animate(this.props);
    //
    //  this.reveal(this.props);
  }

  cascade(children) {
    let newChildren;
    if (typeof children === 'string') {
          newChildren = children.split("").map( (ch, index) => <span key={index} style={{display: 'inline-block', whiteSpace:'pre'}}>{ch}</span> );
          //reverse = this.props.reverse;
        }
        else
          newChildren = React.Children.toArray(children);
    //if (newChildren.length === 1)
    //  return newChildren;
    let { duration, reverse } = this.props[this.isOn || !this.props.outEffect ?'inEffect':'outEffect'],
          count = newChildren.length,
          total = duration*2;
          //reverse = false;
    if (this.props.collapse) {
      total = parseInt(this.state.style.animationDuration, 10);
      duration = total/2;
    }
    let i = reverse ? count : 0;
    //let i = 0;
    newChildren = newChildren.map( child =>
      typeof child === 'object' && child //&& 'type' in child && typeof child.type === 'string'
      ? React.cloneElement(child,{
          style: {
            ...child.props.style,
            ...this.state.style,
            animationDuration: Math.round(cascade( reverse ? i-- : i++ /*i++*/,0 , count, duration, total)) + 'ms',
          },
          //ref: i === count? (el => this.finalEl = el) : void 0,
        })
      : child );
    return newChildren;
  }

  static getInitialCollapseStyle(props) {
    return {
          visibility: props.when  ? 'visible' : 'hidden',
          //height: props.when ? void 0 : 0,
          height: 0,
          //padding: 0,
          //border: 0,
          boxSizing: 'border-box',
    };
  }

  componentWillReceiveProps (props) {
    if (props.cascade) console.log('Rec:', props);
    if ('when' in props)
      this.isOn = !!props.when;
    if (!this.isOn && props.onExited && ('exit' in props) && props.exit === false ) {
      props.onExited();
      return;
    }
    if (props.disabled)
      return;
    //if (props.responsive && !props.when && this.isOn && props.collapse && !this.props.collapse) {
    if (props.collapse && !this.props.collapse) {
      this.setState({ collapse: RevealBase.getInitialCollapseStyle(props)});
      this.isShown = false;
      return;
    }
    //if ( this.isOn && props.collapse === true && this.dummyEl && this.dummyEl.offsetHeight && this.state.style.height !== this.dummyEl.offsetHeight )
    //  this.setState({ style: { ...this.state.style, height: this.dummyEl.offsetHeight } });

    //if ( 'collapse' in props )
    //  this.setState({ collapse: { ...this.state.collapse, height: this.getDimensionValue() } });
    if ( (props.when !== this.props.when) || (props.spy !== this.props.spy))
      this.reveal(props);
    if (this.onRevealTimeout&& !this.isOn)
        this.onRevealTimeout = window.clearTimeout(this.onRevealTimeout);
  }

  getChild() {
    if (this.savedChild && !this.props.disabled)
      return this.savedChild;
    if (typeof this.props.children === 'object') {
       const child = React.Children.only(this.props.children);
       return  (('type' in child) && typeof child.type === 'string') || this.props.refProp !== 'ref'
               ? child
               : <div>{child}</div>;
    }
    else
      return <div>{this.props.children}</div>;
  }

  render() {
    if (this.props.cascade) console.log('Render:', this.props);

    let child = this.getChild();
    //if (this.props.disabled)
    //  return child;
    if (typeof child.ref === 'function')
      this.childRef = child.ref;
    let
      newChildren = false,
      { style, className, children } = child.props;
      //style = { ...style, ...this.props.style };
      //className = this.props.className ? (className||'') + ' ' + this.props.className : className;
    let
      newClass = this.props.disabled ? className : `${ this.props.outEffect ? namespace : '' }${ this.state.className ? ' ' + this.state.className : '' }${ className ? ' ' + className : '' }`||void 0,
      newStyle = this.props.disabled ? style : { ...style, ...this.state.style };
    if (this.props.cascade && !this.props.disabled && children && this.state.style.animationName) {
      newChildren = this.cascade(children);
      newStyle.animationName = void 0;
    }
    const props = { ...this.props.props, className: newClass, style: newStyle, [this.props.refProp]: this.saveRef };
    //if (this.props.collapse && !this.props.disabled)
    //  props.key = 1;
    const el = React.cloneElement(child, props, newChildren||children);
    if ( 'collapse' in this.props )
      return <div /*ref={el => this.dummyEl = el} */style={this.props.disabled?undefined:this.state.collapse}>{el}</div>
    return el;
  }

}

RevealBase.propTypes = propTypes;
RevealBase.defaultProps = defaultProps;
RevealBase.contextTypes = contextTypes;
//RevealBase.displayName = 'RevealBase';
//RevealBase.childContextTypes = childContextTypes;
export default RevealBase;
