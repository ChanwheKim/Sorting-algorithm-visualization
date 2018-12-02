// Load application styles
import 'styles/index.scss';
import { join } from 'path';

// ================================
// START YOUR APP HERE
// ================================

const aniQueue = [];
let isSortingInProgress = false;
const selectors = {
    btnMenu : '.menu-icon',
    sortSelection : '.selection-sort',
    sortLabel : '.sort-label',
    inputNums : '.add-number',
    btnRun : '.btn-run',
    screen : '.screen',
    sortType : '.sort-type',
    insertionSelected : '.selected-insertion',
    comparer : '.selected-comparer',
    warningMessage : '.warning-message',
    bar: '.bar',
};
const VALIDATION = {
    TYPE_FAILURE: 0,
    LENGTH_FAILURE: 1
};

const sortController = (function() {
    let sortType;
    
    document.querySelectorAll(selectors.sortType).forEach(function(sort) {
        sort.addEventListener('click', ctrlSortType);
    });
    document.querySelector(selectors.btnRun).addEventListener('click', ctrlSorts);
    document.querySelector(selectors.btnMenu).addEventListener('click', function(ev) {
        document.querySelector(selectors.sortSelection).classList.toggle('active');
    });

    function ctrlSorts(ev) {
        if(!isSortingInProgress) {
            const numbers = getNumbers();
            const notNumbers = numbers.some(function(num) {
                return isNaN(num);
            });
            const minLength = numbers.length >= 5;
            let term = 550;

            if(notNumbers) {
                displayAlert(VALIDATION.TYPE_FAILURE);
                return ;
            } else if(!minLength) {
                displayAlert(VALIDATION.LENGTH_FAILURE);
                return ;
            }

            isSortingInProgress = true;

            document.querySelector(selectors.warningMessage).classList.remove('warning-active');
        
            switch(sortType) {
                case 'Bubble' :
                    displayBars(numbers);
                    bubbleSort.run(numbers);
                    break;
                case 'Insertion' :
                    displayBars(numbers);
                    insertionSort.run(numbers);
                    break;
                case 'Merge' :
                    displayCells(numbers);
                    mergeSort.run(numbers);
                    break;
                case 'Selection' :
                    displayBars(numbers);
                    selectionSort.run(numbers);
                    break;
                case 'Quick' :
                    displayCells(numbers);
                    quickSort.run(numbers);
                    break;
            }

            aniQueue.forEach(function(aniFunc, idx) {
                const isLastAni = idx === aniQueue.length - 1;

                setTimeout(function() {
                    aniFunc();
                }, term);
                term += 550;

                if(isLastAni) {
                    setTimeout(function() {
                        isSortingInProgress = false;
                    }, term);
                }
            });
        }
    }

    function ctrlSortType(ev) {
        sortType = ev.target.textContent;
        document.querySelector(selectors.sortLabel).classList.remove('active');
        document.querySelector(selectors.sortLabel).classList.add('active');
        document.querySelector(selectors.sortSelection).classList.toggle('active');
        document.querySelector(selectors.sortLabel).textContent = sortType;
    }

    function getNumbers() {
        return document.querySelector(selectors.inputNums).value.split(',').map(function(cur) {
            return parseInt(cur);
        });
    }

    function displayBars(nums) {
        const height = calculateHeight(nums);
    
        nums.forEach(function(num, idx) {
            const bar = document.createElement('div');
            const span = document.createElement('span');
    
            span.innerText = num;
            bar.appendChild(span);
            bar.className = 'bar';
            bar.id = num;
            bar.style.height = height[idx] + 'px';
            document.querySelector(selectors.screen).appendChild(bar);
        });
    }

    function calculateHeight(nums) {
        const maxNum = Math.max.apply(null, nums);
    
        return nums.map(function(num) {
            const minHeight = 27;
            const newHeight = (num / maxNum) * 230;

            return minHeight < newHeight ? newHeight : minHeight;
        });
    }

    function displayAlert(type) {
        const messageEl = document.querySelector(selectors.warningMessage);

        if(type === VALIDATION.TYPE_FAILURE) {
            messageEl.textContent = 'Please input only numbers.';
            messageEl.classList.add('warning-active');
        }

        if(type === VALIDATION.LENGTH_FAILURE) {
            messageEl.textContent = 'Please input more than 5 numbers.';
            messageEl.classList.add('warning-active');
        }
    }
})();

const bubbleSort = (function() {
    function animateSwap(idx1, idx2) {
        const distance = idx2 - idx1;
        const bars = document.querySelectorAll(selectors.bar);
        
        bars[idx1].style.transform = `translate(${50 * distance}px)`;
        bars[idx2].style.transform = `translate(${50 * -distance}px)`;
    }

    function changeElPosition(idx1, idx2) {
        const screen = document.querySelector(selectors.screen);
        const bars = document.querySelectorAll(selectors.bar);
        const minVal = bars[idx2];
        const numSentBack = bars[idx1];

        minVal.style.transform = 'translate(0px)';
        numSentBack.style.transform = 'translate(0px)';
    
        screen.insertBefore(minVal, numSentBack);
        const revPosition = document.querySelectorAll(selectors.bar);
        screen.insertBefore(numSentBack, revPosition[idx2 + 1]);
    }

    function displaySelected(idx1, idx2) {
        const barElements = document.querySelectorAll(selectors.bar);
    
        for(let i = idx1; i <= idx2; i++) {
            barElements[i].classList.add('selected');
        }
    }

    function swap(arr, idx1, idx2) {
        let prev = arr[idx1];
        let next = arr[idx2];
        arr[idx1] = next;
        arr[idx2] = prev;
    }

    return {
        run : function(nums) {
            const wall = nums.length - 1;
        
            for(let k = 0; k < wall; k++) {
                for(let i = 0; i < wall - k; i++) {
                    const lastItem = i === wall - k - 1;

                    aniQueue.push(function () {
                        clearSelected('selected');
                        displaySelected(i, i + 1);
                    });
        
                    if(nums[i] > nums[i + 1]) {
                        swap(nums, i, i + 1);
                        aniQueue.push(animateSwap.bind(null, i, i + 1));
                        aniQueue.push(changeElPosition.bind(null, i, i + 1));
                    }
        
                    if(lastItem) {
                        aniQueue.push(function() {
                            clearSelected('selected');
                            displayCompleteBar(wall - k);
                        });
                    }
                }
            }
        }
    }
})();

const insertionSort = (function() {
    function displayInsertionSelected(idx) {
        const barElements = document.querySelectorAll(selectors.bar);
        barElements[idx].classList.add('selected-insertion');
    }

    function landingBar() {
        document.querySelector(selectors.selected).style.transform = 'translate(0px, 0px)';
        document.querySelector(selectors.selected).classList.add('completed-bar');
    }

    function displayCompareBar(idx) {
        const barElements = document.querySelectorAll(selectors.bar);
        barElements[idx].classList.add('selected-comparer');
    }

    function animateSwap() {
        document.querySelector(selectors.comparer).style.transition = 'all .6s';
        document.querySelector(selectors.comparer).style.transform = 'translateX(50px)';
        document.querySelector(selectors.insertionSelected).style.transform = 'translate(-50px, 120%)';
    }

    function changeElPosition() {
        const selected = document.querySelector(selectors.insertionSelected);
        const comparer = document.querySelector(selectors.comparer);
        
        comparer.style.transition = 'no';
        comparer.style.transform = 'translateX(0px)';
        selected.style.transform = 'translate(0px, 120%)';
        document.querySelector(selectors.screen).insertBefore(selected, comparer);
        clearSelected('selected-comparer');
    }

    function displayInsertion() {
        document.querySelector(selectors.insertionSelected).style.transition = 'all .6s';
        document.querySelector(selectors.insertionSelected).style.transform = 'translate(0px, 0px)';
        document.querySelector(selectors.insertionSelected).classList.add('completed-bar');
        document.querySelector(selectors.comparer).classList.add('completed-bar');
        document.querySelector(selectors.insertionSelected).classList.remove('selected-insertion');
        document.querySelector(selectors.comparer).classList.remove('selected-comparer');
    }

    return {
        run : function (nums) { 
            for(let i = 1; i <= nums.length - 1; i++) {
                const curValue = nums.splice(i, 1)[0];
        
                for(let j = i - 1; j >= 0; j--) {
                    aniQueue.push(function() {
                        if(!document.querySelector(selectors.insertionSelected)) {
                            displayInsertionSelected(i);
                        }
                    });

                    aniQueue.push(displayCompareBar.bind(null, j));
        
                    if(curValue > nums[j]) {
                        nums.splice(j + 1, 0, curValue);
                        aniQueue.push(displayInsertion);
                        break;
                    } else {
                        aniQueue.push(animateSwap);
                        aniQueue.push(changeElPosition);
                    }
        
                    if(j === 0) {
                        nums.unshift(curValue);
                        aniQueue.push(landingBar);
                        aniQueue.push(function() {
                            clearSelected('selected-insertion');
                            clearSelected('selected-comparer');
                        });
                    }
                }
        
                if(i === nums.length - 1) {
                    aniQueue.push(function() {
                        const barElements = document.querySelectorAll(selectors.bar);
                        barElements[barElements.length - 1].classList.add('completed-bar');
                    });
                }
            }
        }
    }
})();

const mergeSort = (function() {
    function assignXYValue(numbers, direction) {
        let firstMove;
        let move;

        if(direction === 'left') {
            firstMove = -90;
            move = -15;
        } else if(direction === 'right') {
            firstMove = 90;
            move = 15;
        }

        numbers.forEach(function(curNum) {
            const curCellEl = document.getElementById(curNum);
            let y = parseInt(curCellEl.offsetTop);
            let x = parseInt(curCellEl.style.left);
            const firstFloor = y === 300;

            if(firstFloor) {
                x = x + firstMove;
            } else {
                x = x + move;
            }

            curCellEl.style.left = x + 'px';
            curCellEl.style.top = y - 70 + 'px';
        });
    }

    function displaySplit(nums, direction) {
        if(direction === 'left') {
            const copiedNums = nums.slice(); 
            aniQueue.push(assignXYValue.bind(null, copiedNums, 'left'));
        } else if(direction === 'right') {
            const copiedNums = nums.slice();
            aniQueue.push(assignXYValue.bind(null, copiedNums, 'right'));
        }
    }

    function merge(leftArr, rightArr) {
        const mergedArr = [];
        let leftPosition;

        function calculatePosition(num1, num2, leftNodes) {
            const gap = calculateGap(num1, num2);
            leftPosition = document.getElementById(leftNodes[0]).offsetLeft + (gap / 2);
        }

        aniQueue.push(calculatePosition.bind(null, leftArr[leftArr.length - 1], rightArr[0], leftArr.slice()));
    
        while(leftArr.length !== 0 || rightArr.length !== 0) {
            let restNumbers;
    
            if(leftArr.legnth === 0 || rightArr.length === 0) {
                restNumbers = leftArr.concat(rightArr);
                restNumbers.forEach(function(cur) {

                    aniQueue.push(function() {
                        displayMerging(cur, leftPosition);
                        leftPosition += 30;
                    });
                });
                break;
            }
    
            if(leftArr[0] <= rightArr[0]) {
                const curNum = leftArr.shift();

                aniQueue.push(function() {
                    displayMerging(curNum, leftPosition);
                    leftPosition += 30;
                });
                leftPosition += 30;
    
                mergedArr.push(curNum);
            } else {
                const curNum = rightArr.shift();

                aniQueue.push(function() {
                    displayMerging(curNum, leftPosition);
                    leftPosition += 30;
                });
                leftPosition += 30;
    
                mergedArr.push(curNum);
            }
        }
    
        return mergedArr.concat(leftArr, rightArr);
    };

    function calculateGap(lastNumOfLeft, firstNumOfRight) {
        const endOfLeft = document.getElementById(lastNumOfLeft).offsetLeft + 30;
        const beginOfRight = document.getElementById(firstNumOfRight).offsetLeft;
        
        return beginOfRight - endOfLeft;
    }

    function displayMerging(val, location) {
        const mergingEl = document.getElementById(val);
        let y = parseInt(mergingEl.style.top);

        mergingEl.style.left = location + 'px';
        mergingEl.style.top = y + 70 + 'px';
    }

    return {
        run : function (nums, direction) {
            displaySplit(nums, direction);
        
            if(nums.length === 0 || nums.length === 1) {
                return nums;
            }
        
            const middle = Math.floor(nums.length / 2);
            const left = mergeSort.run(nums.slice(0, middle), 'left');
            const right = mergeSort.run(nums.slice(middle), 'right');
        
            return merge(left, right);
        },

        displayCells : function (nums) {
            let leftPosition = 400 - (nums.length * 30 / 2);
        
            nums.forEach(function(num) {
                const cell = document.createElement('div');

                cell.className = 'merge-cell';
                cell.id = num;
                cell.textContent = num;
                cell.style.left = leftPosition + 'px';
                document.querySelector(selectors.screen).appendChild(cell);
                leftPosition += 30;
            });
        
            document.querySelector(selectors.screen).classList.add('screen-merge');
        },
    };
})();

const selectionSort = (function() {
    function displaySelectionSelected(idx) {
        const barElements = document.querySelectorAll(selectors.bar);
        barElements[idx].classList.add('selected-minIdx');
    }
    
    function displayTraverser(idx) {
        const barElements = document.querySelectorAll(selectors.bar);
        barElements[idx].classList.add('selected-comparer');
    }
    
    function animateSwap(idx1, idx2) {
        const distance = idx2 - idx1;
        const bars = document.querySelectorAll(selectors.bar);
        
        bars[idx1].style.transform = `translate(${50 * distance}px)`;
        bars[idx2].style.transform = `translate(${50 * -distance}px)`;
    }
    
    function changeElPosition(idx1, idx2) {
        const screen = document.querySelector(selectors.screen);
        const bars = document.querySelectorAll(selectors.bar);
        const minVal = bars[idx2];
        const numSentBack = bars[idx1];

        minVal.style.transform = 'translate(0px)';
        numSentBack.style.transform = 'translate(0px)';
    
        screen.insertBefore(minVal, numSentBack);
        const revPosition = document.querySelectorAll(selectors.bar);
        screen.insertBefore(numSentBack, revPosition[idx2 + 1]);
        minVal.classList.add('completed-bar');
    }
    
    function displayBarCompleted(idx) {
        const bars = document.querySelectorAll(selectors.bar);
        bars[idx].classList.add('completed-bar');
    }

    function swap(arr, idx1, idx2) {
        let prev = arr[idx1];
        let next = arr[idx2];
        arr[idx1] = next;
        arr[idx2] = prev;
    }

    return {
        run : function (nums) {
            for(let k = 0; k < nums.length - 1; k++) {
                let minIdx = k;

                aniQueue.push(function() {
                    clearSelected('selected-minIdx');
                    displaySelectionSelected(k);
                });
        
                for(let i = k + 1; i < nums.length; i++) {
                    aniQueue.push(function() {
                        clearSelected('selected-comparer');
                        displayTraverser(i);
                    });
        
                    if(nums[minIdx] > nums[i]) {
                        aniQueue.push(function() {
                            clearSelected('selected-minIdx');
                            displaySelectionSelected(i);
                        });
                        minIdx = i;
                    }
        
                    if(i === nums.length - 1) {
                        aniQueue.push(function() {
                            clearSelected('selected-comparer');
                        });
                    }
                }
        
                if(nums[k] > nums[minIdx]) {
                    aniQueue.push(displaySelectionSelected.bind(null, k));
                    aniQueue.push(animateSwap.bind(null, k, minIdx));
                    aniQueue.push(changeElPosition.bind(null, k, minIdx));
                    swap(nums, k, minIdx);
                }
                
                aniQueue.push(displayBarCompleted.bind(null, k));
        
                if(k === nums.length - 2) {
                    aniQueue.push(function() {
                        clearSelected('selected-comparer');
                        clearSelected('selected-minIdx');
                        displayCompleteBar(nums.length - 1);
                    });
                }
            }

            return nums;
        },
    }
})();

function clearSelected(className) {
    const barElements = document.querySelectorAll(selectors.bar);

    for(let i = 0; i < barElements.length; i++) {
        barElements[i].classList.remove(className);
    }
}

function displayCompleteBar(idx) {
    const barElements = document.querySelectorAll(selectors.bar);
    
    if(idx === 1) {
        barElements[0].classList.add('completed-bar');
    }

    barElements[idx].classList.add('completed-bar');
}

 function displayCells(nums) {
    let leftPosition = 400 - (nums.length * 30 / 2);

    nums.forEach(function(num) {
        const cell = document.createElement('div');

        cell.className = 'cell';
        cell.id = num;
        cell.textContent = num;
        cell.style.left = leftPosition + 'px';
        document.querySelector(selectors.screen).appendChild(cell);
        leftPosition += 30;
    });

    document.querySelector(selectors.screen).classList.add('screen-merge');
}

const quickSort = (function() {
    function partition(arr, start, end) {
        let pivotLoc = start;
        let pivotIdx = end;
        
        while(pivotLoc !== pivotIdx) {
            if(arr[pivotLoc] <= arr[pivotIdx]) {
                pivotLoc++;
            } else {
                swap(arr, pivotLoc, pivotIdx);
                swap(arr, pivotLoc, --pivotIdx);
            }
        }

        return pivotLoc;
    }

    function swap(arr, idx1, idx2) {
        let temp = arr[idx1];
        arr[idx1] = arr[idx2];
        arr[idx2] = temp;
    }

    return {
        run : function(arr, startIdx, endIdx) {
            if(startIdx === undefined && endIdx === undefined) {
                startIdx = 0;
                endIdx = arr.length - 1;
            }

            if(startIdx < endIdx) {
                const pivotLoc = partition(arr, startIdx, endIdx);
    
                quickSort.run(arr, startIdx, pivotLoc - 1);
                quickSort.run(arr, pivotLoc + 1, endIdx);
            }

            if(endIdx - startIdx === arr.length - 1) {
                return arr;
            }
        },
    }
})();
