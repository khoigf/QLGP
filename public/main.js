
const multiValueDelimiter = '###'
const imageMaxSizes = 100*1000 // Btyes
const popUpViewPersonBaseZIndex = 100000
const defaultAvatarUrl = './resources/default-avatar.jpg'

let randomId = () => `${Math.round(Math.random()*10E12)} r o t c e n o C y l i m a F`.split(' ').reverse().join('')

function popUpLoading() {
    let $popUp = bigPopUp(`<div class="loader"></div>
        <style>
            .loader {
            width: 60px;
            aspect-ratio: 4;
            background: radial-gradient(circle closest-side,#000 90%,#0000) 0/calc(100%/3) 100% space;
            clip-path: inset(0 100% 0 0);
            animation: l1 1s steps(4) infinite;
            }
            @keyframes l1 {to{clip-path: inset(0 -34% 0 0)}}
        </style>
    `, {
        script: ($popUp) => {
            $popUp.find('.button-group-background').remove()

            $popUp.find('.content').css({
                display: 'flex',
                'justify-content' : 'center',
                'align-items': 'center',
                padding: 0
            })
        },
        hideCloseButton: true,
        style: {
            height: '300px',
            width: '400px'
        }
    })

    return () => $popUp.remove()
}

function viewImage(imageUrl) {
    let $element = $(`<div style="position: fixed; top: 0; right: 0; bottom: 0; left: 0; background-color: black; z-index: 200000; display: flex; align-items: center; justify-content: center;">
        <img src="${imageUrl}" style="max-width: 100%; max-height: 100%;"/>
        <svg class="icon close">
            <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-x"></use>
        </svg>
    </div>`)

    $element.find('.close').click(() => $element.remove()).css({
        position: 'absolute',
        right: '20px',
        top: '20px',
        color: 'white',
        'font-size': '4rem',
        cursor: 'pointer',
        'border-radius': '50%',
        padding: '0.4rem',
        height: '3rem',
        width: '3rem',
        'background-color': 'black'
    })

    $(document.body).append($element)
}

function popUpAddField(personId, addSuccessCallback) {
    let html = `<form class="row g-3">
        <div class="col-md-6">
            <label for="field-name" class="form-label">Tên trường thông tin <span style="color: red;">*</span></label>
            <input type="text" class="form-control" id="field-name" placeholder="Ví dụ: Tiểu sử chi tiết" name="name">
            <div class="invalid-feedback"></div>
        </div>
        
        <div class="col-md-6">
            <label for="field-type" class="form-label">Kiểu dữ liệu</label>
            <select id="field-type" class="form-select" name="type">
                <option value="STRING" selected>Văn bản</option>
                <option value="IMAGE">Ảnh</option>
                <option value="DATE">Ngày tháng (dương lịch)</option>
                <option value="LUNAR_DATE">Ngày tháng (âm lịch)</option>
                <option value="PERSON">Người</option>
            </select>
        </div>

        <div class="col-12">
            <label for="field-desc" class="form-label">Mô tả về trường thông tin này</label>
            <input type="text" class="form-control" id="field-desc" name="description" placeholder="Ví dụ: Đây là trường thông tin ghi các tiểu sử của người này">
        </div>

        <div class="col-6">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="field-multivalue" name="isMultiValue">
                <label class="form-check-label" for="field-multivalue">Trường thông tin là đa giá trị</label>
            </div>
        </div>

        <div class="col-6">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="fieldForAllPeople" name="isForAllPeople">
                <label class="form-check-label" for="fieldForAllPeople">Thêm cho tất cả người thân của tôi</label>
            </div>
        </div>
    </form>`

    let $nameInput, $nameInputFeedback
    bigPopUp(html, {
        zIndex: 120000,
        script: ($popUp) => {
            $nameInput = $popUp.find('input#field-name')
            $nameInputFeedback = $nameInput.parent().find('.invalid-feedback')

            $nameInput.keydown(() => {
                $nameInputFeedback.hide()
                $nameInput.removeClass('is-invalid')
            })
        },
        hideCloseButton: true,
        buttons: [
            {
                html: 'Thoát',
                click: $popUp => $popUp.remove()
            },
            {
                html: 'Thêm trường thông tin',
                type: 'success',
                click: $popUp => {
                    if ($nameInput.val() == '') {
                        $nameInput.addClass('is-invalid')
                        $nameInputFeedback.show().html('Không được bỏ trống phần tên!')
                        return
                    }

                    let data = {personId}
                    let inputs = [...$popUp.find('input'), ...$popUp.find('select')]
                    inputs.forEach(input => {
                        data[input.name] = (input.type == 'checkbox') ? (input.checked) : input.value
                    })

                    api.addField({data}).then(({newFieldDef}) => {
                        addSuccessCallback(newFieldDef)
                        $popUp.remove()
                    })
                }
            }
        ]
    })
}

function popUpEditField({id, name, description, isForAllPeople}, updateSuccessCallback) {
    let html = `<form class="row g-3">
        <h1>Cập nhật thuộc tính trường thông tin</h1>
        ${isForAllPeople ? '<h6>Đây là trường thông tin chung. Tất cả các thay đổi của trường thông tin này sẽ áp dụng cho tất cả người thân của bạn.</h6>' : ''}

        <div class="col-md-12">
            <label for="field-name" class="form-label">Tên trường thông tin <span style="color: red;">*</span></label>
            <input type="text" class="form-control" id="field-name" placeholder="Ví dụ: Tiểu sử chi tiết" name="name" value="${name}">
            <div class="invalid-feedback"></div>
        </div>

        <div class="col-12">
            <label for="field-desc" class="form-label">Mô tả về trường thông tin này</label>
            <input type="text" class="form-control" id="field-desc" name="description" value="${description}" placeholder="Ví dụ: Đây là trường thông tin ghi các tiểu sử của người này">
        </div>
    </form>`

    let $nameInput, $nameInputFeedback
    bigPopUp(html, {
        zIndex: 120000,
        script: ($popUp) => {
            $nameInput = $popUp.find('input#field-name')
            $nameInputFeedback = $nameInput.parent().find('.invalid-feedback')

            $nameInput.keydown(() => {
                $nameInputFeedback.hide()
                $nameInput.removeClass('is-invalid')
            })
        },
        hideCloseButton: true,
        buttons: [
            {
                html: 'Thoát',
                click: $popUp => $popUp.remove()
            },
            {
                html: 'Xóa trường thông tin',
                type: 'danger',
                click: $popUp => {
                    popUpConfirm('<h5>Bạn có chắc chắn muốn xóa trường thông tin này không?</h5>' + (isForAllPeople ? '<h6 class="text-danger">Tất cả người thân của bạn cũng sẽ mất trường thông tin này!</h6>' : ''), () => {
                        api.deleteField({id}).then(() => {
                            $popUp.remove()
                            updateSuccessCallback({deleted: true})
                        })
                    })
                }
            },
            {
                html: 'Lưu thay đổi',
                type: 'success',
                click: $popUp => {
                    if ($nameInput.val() == '') {
                        $nameInput.addClass('is-invalid')
                        $nameInputFeedback.show().html('Không được bỏ trống phần tên!')
                        return
                    }

                    let data = {id}
                    let inputs = [...$popUp.find('input'), ...$popUp.find('select')]
                    inputs.forEach(input => {
                        data[input.name] = (input.type == 'checkbox') ? (input.checked) : input.value
                    })

                    api.updateField({data}).then(() => {
                        updateSuccessCallback(data)
                        $popUp.remove()
                    })
                }
            }
        ]
    })
}

function popUpAddPerson(addSuccessCallback, { gender, target, asRole, targetGender } = {}) {
    let fieldFactoryReturnedValues = []
    bigPopUp('', {
        script: $popUp => {
            let $from = $('<form class="row g-3"></form>')
            fieldFactoryReturnedValues = [
                FieldInput$ElementFactory({type: 'STRING', name: 'Tên gọi', placeholder: 'Ví dụ: Ông Nguyễn Văn A', code: 'callname'}),
                FieldInput$ElementFactory((() => {
                    let result = {type: 'GENDER', name: 'Giới tính', code: 'gender'}
                    if (gender) {
                        Object.assign(result, {
                            value: gender, disabled: true
                        })
                    }
                    return result
                })()),
                FieldInput$ElementFactory({type: 'DATE', name: 'Ngày sinh', code: 'birthday'}),
                FieldInput$ElementFactory({type: 'LUNAR_DATE', name: 'Ngày mất', code: 'deathday'}),
                FieldInput$ElementFactory({type: 'PERSON', name: 'Vợ / Chồng', code: 'spouse'}),
                FieldInput$ElementFactory((() => {
                    let result = {type: 'PERSON', name: 'Bố', code: 'father'}
                    if (asRole == 'child' && targetGender == 'Nam') {
                        Object.assign(result, {
                            value: target,
                            disabled: true
                        })
                    }
                    return result
                })()),
                FieldInput$ElementFactory((() => {
                    let result = {type: 'PERSON', name: 'Mẹ', code: 'mother'}
                    if (asRole == 'child' && targetGender == 'Nữ') {
                        Object.assign(result, {
                            value: target,
                            disabled: true
                        })
                    }
                    return result
                })()),
                FieldInput$ElementFactory({type: 'IMAGE', name: 'Ảnh', code: 'avatar'})
            ]
            $from.append(fieldFactoryReturnedValues.map(i => i[0]))

            $popUp.find('.content').append($from)
        },
        hideCloseButton: true,
        buttons: [
            {
                html: 'Thoát',
                click: $popUp => {$popUp.remove(); $(document.body).removeClass('stop-scrolling')}
            },
            {
                html: 'Thêm người thân',
                type: 'success',
                click: $popUp => {
                    if (fieldFactoryReturnedValues.every(i => i[1]())) { // All fields valid
                        let data = fieldFactoryReturnedValues.map(i => i[2]())
                        api.addPerson({data, target, asRole}).then(() => {
                            $popUp.remove()
                            $(document.body).removeClass('stop-scrolling')
                            addSuccessCallback()
                        })
                    }
                }
            }
        ]
    })
}

function popUpPickPerson(callback, {isMultiValue, maleOnly, femaleOnly, exceptIds}) {
    isMultiValue = isMultiValue || false
    maleOnly = maleOnly || false
    femaleOnly = femaleOnly || false
    exceptIds = exceptIds || []
    exceptIds = new Set(exceptIds)

    let getPickedPeople = null

    bigPopUp(`
        ${maleOnly ? '<h1>Danh sách người thân có giới tính Nam</h1>' : ''}
        ${femaleOnly ? '<h1>Danh sách người thân có giới tính Nữ</h1>' : ''}
        <input type="text" class="form-control find-person" placeholder="Nhập bất cứ thông tin gì về người muốn tìm...">
        <button class="btn btn-primary delete-all" style="margin: 1em 0; float: right;">Xóa tất cả người đã chọn</button>
        <table class="table border mb-0">
            <tbody>
            </tbody>
        </table>
    `,
    {
        zIndex: 120000,
        script: ($popUp, $content) => {
            api.getPeopleOfUserBaseInfo().then(people => {
                if (maleOnly) people = people.filter(({gender}) => gender == 'Nam')
                else if (femaleOnly) people = people.filter(({gender}) => gender != 'Nam')
                people = people.filter(({id}) => !exceptIds.has(id))
                
                let list$persons = []
                let rdName = randomId()

                people.forEach(person => {
                    let {callname, avatar, searchString} = person
                    let $person = $(`<tr class="align-middle">
                        <td style="width: 3em; position: relative;"><input class="form-check-input" type="${isMultiValue ? 'checkbox' : 'radio'}" style="position: absolute;
                            top: 50%; left: 50%; transform: translate(-50%, -50%); margin: 0;" ${isMultiValue ? '' : `name="${rdName}"`}></td>
                        <td style="width: 3em;">
                            <div class="avatar avatar-md">
                                <img class="avatar-img" src="${avatar || defaultAvatarUrl}">
                            </div>
                        </td>
                        <td><div>${callname}</div></td>
                    </tr>`)

                    $content.find('tbody').append($person)
                    list$persons.push($person)

                    searchString = searchString.toLowerCase()
                    while (searchString.includes('  ')) searchString = searchString.replaceAll('  ', ' ').trim()
                    let searchString2 = new Set(searchString.split(' '))
                    let searchStringNormalized2 = new Set(searchString.split(' ').map(w => removeAccents(w)))
                    let searchStringNormalized = [...searchStringNormalized2].join(' ')

                    $person.score = (vs, nvs) => {
                        let score = 0
                        if ($person.find('input')[0].checked) {
                            score = 1
                        }

                        for (let v of nvs) {
                            if (searchStringNormalized.includes(v)) score += 5
                            if (searchStringNormalized2.has(v)) score += 10
                        }
                        for (let v of vs) {
                            if (searchString.includes(v)) score += 10
                            if (searchString2.has(v)) score += 20
                        }

                        return score
                    }

                    $person.choosed = () => $person.find('input')[0].checked
                    $person.getPerson = () => person
                })

                $content.find('.find-person').keyup(function () {
                    let value = $(this).val().trim().toLowerCase()
                    
                    while (value.includes('  ')) value = value.replaceAll('  ', ' ').trim()
                    let vs = [...new Set(value.split(' '))]
                    let nvs = [...new Set(vs.map(v => removeAccents(v)))]
                    
                    let scores = value == '' ? list$persons.map(_ => 1) : list$persons.map($person => $person.score(vs, nvs))
                    let indices = range(list$persons.length)
                    indices.sort((i1, i2) => scores[i2] - scores[i1])

                    scores = indices.map(i => scores[i])
                    list$persons = indices.map(i => list$persons[i])
                    list$persons.forEach($person => $person.hide())

                    for (let i of range(list$persons.length)) {
                        if (scores[i] == 0) list$persons[i].hide()
                        else $content.find('tbody').append(list$persons[i].show())
                    }
                })

                $content.find('.delete-all').click(() => list$persons.forEach($person => $person.find('input')[0].checked = false))

                getPickedPeople = () => list$persons.filter($person => $person.choosed()).map($person => $person.getPerson())
            })
        },
        hideCloseButton: true,
        buttons: [{
            html: 'Xác nhận',
            type: 'success',
            click: $popUp => {
                $popUp.remove()
                callback(getPickedPeople ? getPickedPeople() : [])
            }
        }]
    })
}

function FieldInput$ElementFactory({id, code, type, placeholder, name, description, isMultiValue, value, isForAllPeople, personId, disabled}, updateFieldDefinitionCallback) {
    value = value || ''
    let $element, validate, getValue, valueChanged
    let labelId = randomId()

    function dateValidation(s, isLunarDate = false, testSupportRange = false) {
        // Return [isValid, Message if not valid]
        if (!DateLib.isInValidForm(s)) {
            return [false, 'Sai định dạng NGÀY/THÁNG/NĂM!']
        }

        if (testSupportRange && (!DateLib.isDateInSupportRange(s))) {
            return [false, 'Đối với kiểu dữ liệu này, chỉ hỗ trợ ngày tháng từ năm 1801 đến năm 2198!']
        }

        if (!(isLunarDate ? DateLib.isValidLunarDate(s) : DateLib.isValidDate(s))) {
            return [false, 'Không tồn tại ngày tháng này!']
        }

        return [true]
    }

    if (isMultiValue) {
        let buttonAddonId = randomId()
        let counter = 0
        let mapIndexToValue = {}
        let addValue = val => {
            mapIndexToValue[++counter] = val
            return counter
        }
        let removeValue = index => delete mapIndexToValue[index]
        let showAddedValue // Implement this

        switch (type) {
            case 'STRING':
                $element = $(`<div class="col-12">
                    <label for="${labelId}" class="form-label">${name}</label>
                    <div class="input-group mb-3" style="margin-bottom: 0 !important;">
                        <input type="text" class="form-control" id="${labelId}" ${placeholder ? `placeholder="${placeholder}"` : ''}>
                        <button class="btn btn-outline-secondary" type="button" id="${buttonAddonId}">Thêm giá trị</button>
                    </div>
                    
                    <div class="card value-list" style="width: 100%;">
                        <div class="card-header" style="color: #9da5b1; border: none;">Chưa có giá trị</div>
                        <ul class="list-group list-group-flush"></ul>
                    </div>
                </div>`)

                showAddedValue = function (val) {
                    let index = addValue(val)

                    $element.find('.value-list .card-header').remove()

                    let $value = $(`<li class="list-group-item" style="position: relative;">
                        ${val}
                        <svg class="icon" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); cursor: pointer;">
                            <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-trash"></use>
                        </svg>
                    </li>`)

                    $value.find('svg').click(() => {
                        removeValue(index)
                        $value.remove()
                        if ($element.find('ul > li').length == 0) {
                            $element.find('.value-list').append('<div class="card-header" style="color: #9da5b1; border: none;">Chưa có giá trị</div>')
                        }
                    })

                    $element.find('.value-list ul').append($value)
                }

                $element.find(`#${buttonAddonId}`).click(() => {
                    let $input = $element.find(`#${labelId}`)
                    let value = $input.val()
                    if (value == '') {
                        return
                    }
                    $input.val('')
                    showAddedValue(value)
                })
                break
            case 'DATE':
                $element = $(`<div class="col-md-5">
                    <label for="${labelId}" class="form-label">${name}</label>
                    <div class="input-group mb-3" style="margin-bottom: 0 !important;">
                        <input type="text" class="form-control" id="${labelId}" ${placeholder ? `placeholder="${placeholder}"` : 'placeholder="Ngày dương lịch định dạng NGÀY/THÁNG/NĂM"'}>
                        <button class="btn btn-outline-secondary" type="button" id="${buttonAddonId}" style="border-radius: var(--cui-btn-border-radius);
                        border-top-left-radius: 0; border-bottom-left-radius: 0;">
                            Thêm giá trị
                        </button>
                        <div class="invalid-feedback" style="margin-top: 0;"></div>
                    </div>
                    
                    <div class="card value-list" style="width: 100%;">
                        <div class="card-header" style="color: #9da5b1; border: none;">Chưa có giá trị</div>
                        <ul class="list-group list-group-flush"></ul>
                    </div>
                </div>`)

                let $input = $element.find(`#${labelId}`)
                let $feedBack = $element.find(`.invalid-feedback`)

                $input.keydown(() => {
                    $input.removeClass('is-invalid')
                    $feedBack.hide()
                })

                showAddedValue = function (val) {
                    let index = addValue(val)

                    $element.find('.value-list .card-header').remove()

                    let $value = $(`<li class="list-group-item" style="position: relative;">
                        ${val}
                        <svg class="icon" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); cursor: pointer;">
                            <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-trash"></use>
                        </svg>
                    </li>`)

                    $value.find('svg').click(() => {
                        removeValue(index)
                        $value.remove()
                        if ($element.find('ul > li').length == 0) {
                            $element.find('.value-list').append('<div class="card-header" style="color: #9da5b1; border: none;">Chưa có giá trị</div>')
                        }
                    })

                    $element.find('.value-list ul').append($value)
                }

                $element.find(`#${buttonAddonId}`).click(() => {
                    let $input = $element.find(`#${labelId}`)
                    let value = $input.val()
                    if (value == '') {
                        return
                    }

                    let [isValid, message] = dateValidation(value)
                    if (isValid) {
                        $input.val('')
                        showAddedValue(value)
                        return
                    }

                    $input.addClass('is-invalid')
                    $feedBack.show().html(message)
                })
                break
            case 'LUNAR_DATE':
                let id1 = randomId(), id2 = randomId(), rdName = randomId()
                $element = $(`<div class="col-md-5">
                    <label for="${labelId}" class="form-label">${name}</label>
                    <div class="row" style="margin: 0;">
                        <div class="form-check col-md-6">
                            <input class="form-check-input" type="radio" id="${id1}" name="${rdName}">
                            <label class="form-check-label" for="${id1}">
                                Dương lịch
                            </label>
                        </div>
                        <div class="form-check col-md-6">
                            <input class="form-check-input" type="radio" id="${id2}" name="${rdName}" checked>
                            <label class="form-check-label" for="${id2}">
                                Âm lịch
                            </label>
                        </div>
                    </div>
                    <div class="input-group mb-3" style="margin-bottom: 0 !important;">
                        <input type="text" class="form-control" id="${labelId}" ${placeholder ? `placeholder="${placeholder}"` : 'placeholder="Ngày âm lịch định dạng NGÀY/THÁNG/NĂM"'}>
                        <button class="btn btn-outline-secondary" type="button" id="${buttonAddonId}" style="border-radius: var(--cui-btn-border-radius);
                        border-top-left-radius: 0; border-bottom-left-radius: 0;">
                            Thêm giá trị
                        </button>
                        <div class="invalid-feedback" style="margin-top: 0;"></div>
                    </div>
                    
                    <div class="card value-list" style="width: 100%;">
                        <div class="card-header" style="color: #9da5b1; border: none;">Chưa có giá trị</div>
                        <ul class="list-group list-group-flush"></ul>
                    </div>
                </div>`)

                let $input2 = $element.find(`#${labelId}`)
                let $feedBack2 = $element.find(`.invalid-feedback`)

                $input2.keydown(() => {
                    $input2.removeClass('is-invalid')
                    $feedBack2.hide()
                })

                $element.find(`#${id1}`).click(() => {
                    $input2.attr('placeholder', 'Ngày dương lịch định dạng NGÀY/THÁNG/NĂM')
                })
                $element.find(`#${id2}`).click(() => {
                    $input2.attr('placeholder', 'Ngày âm lịch định dạng NGÀY/THÁNG/NĂM')
                })

                showAddedValue = function (val) {
                    let index = addValue(val)
                    $element.find('.value-list .card-header').remove()
    
                    let $value = $(`<li class="list-group-item" style="position: relative;">
                        ${val} ~ ${DateLib.lunarDateToDate(val)} dương lịch
                        <svg class="icon" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); cursor: pointer;">
                            <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-trash"></use>
                        </svg>
                    </li>`)
    
                    $value.find('svg').click(() => {
                        removeValue(index)
                        $value.remove()
                        if ($element.find('ul > li').length == 0) {
                            $element.find('.value-list').append('<div class="card-header" style="color: #9da5b1; border: none;">Chưa có giá trị</div>')
                        }
                    })
    
                    $element.find('.value-list ul').append($value)
                }

                $element.find(`#${buttonAddonId}`).click(() => {
                    let value = $input2.val()
                    if (value == '') {
                        return
                    }

                    let isLunarDate = $element.find(`#${id2}`)[0].checked

                    let [isValid, message] = dateValidation(value, isLunarDate, true)
                    if (isValid) {
                        $input2.val('')
                        showAddedValue(isLunarDate ? value : DateLib.dateToLunarDate(value))
                        return
                    }

                    $input2.addClass('is-invalid')
                    $feedBack2.show().html(message)
                })
                break
            case 'PERSON':
                $element = $(`<div class="col-md-3">
                    <label for="${labelId}" class="form-label">${name}</label>
                    <div class="input-group" style="position: relative;">
                        <input type="text" class="form-control" value="Chọn..." readonly style="cursor: pointer;">
                        <button class="btn btn-outline-secondary" type="button" id="${labelId}">Chọn</button>
                    </div>
                    
                    <div class="card value-list" style="width: 100%;">
                        <div class="card-header" style="color: #9da5b1; border: none;">Chưa có ai</div>
                        <ul class="list-group list-group-flush"></ul>
                    </div>
                </div>`)
                
                let choosedPersonIds = []

                showAddedValue = function (val) {
                    let callFromPopUpPickPerson = Array.isArray(val)

                    function _add(person) {
                        // person can be an object or just a single id

                        $element.find('.value-list .card-header').remove()

                        let id = callFromPopUpPickPerson ? person.id : person
                        let index = addValue(id)
                        choosedPersonIds.push(id)

                        let $person = $(`<li class="list-group-item" style="position: relative; height: 4rem; display: flex; align-items: center;">
                            <div class="name">${person.callname || 'Đang tải...'}</div>
                        </li>`)

                        $element.find('.value-list ul').append($person)

                        function _addRemainingEvents(avatar) {
                            $person.prepend(`<img src="${avatar || defaultAvatarUrl}" style="height: 100%; margin-right: 0.8rem;" class="my-img">`)
                            $person.append(
                                $(`<svg class="icon" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); cursor: pointer;">
                                    <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-trash"></use>
                                </svg>`).click(() => {
                                    removeValue(index)
                                    $person.remove()
                                    choosedPersonIds = choosedPersonIds.filter(_id => _id != id)
                                    if ($element.find('ul > li').length == 0) {
                                        $element.find('.value-list').append('<div class="card-header" style="color: #9da5b1; border: none;">Chưa có ai</div>')
                                    }
                                })
                            )
                        }
    
                        if (callFromPopUpPickPerson) {
                            _addRemainingEvents(person.avatar)
                        } else {
                            api.getPersonBaseInfo({id: person}).then(({avatar, callname}) => {
                                $person.find('.name').html(callname)
                                _addRemainingEvents(avatar)
                            })
                        }
                    }

                    if (callFromPopUpPickPerson) {
                        val.forEach(person => _add(person))
                    } else {
                        _add(val)
                    }
                }
                $element.find('button').click(() => {
                    popUpPickPerson(showAddedValue, {
                        isMultiValue,
                        maleOnly: code == 'father' ? true : false,
                        femaleOnly: code == 'mother' ? true : false,
                        exceptIds: choosedPersonIds
                    })
                })
                break
            case 'IMAGE':
                $element = $(`<div class="mb-3">
                    <label for="${labelId}" class="form-label">${name}</label>
                    <div class="input-group mb-3">
                        <button class="btn btn-outline-secondary add-image" type="button">Tải ảnh lên</button>
                        <input type="text" class="form-control" id="${labelId}" value="Chưa có ảnh được chọn" readonly style="cursor: pointer">
                    </div>
                    <input type="file" style="display:none;" accept="image/*">
                    <div class="preview-image">
                        <button type="button" class="btn btn-primary add-image" style="display:block;">Thêm ảnh</button>
                        <div class="images" style="display: flex; flex-wrap: wrap;">
                            
                        </div>
                    </div>
                </div>`)

                $element.find('button.add-image').click(() => $element.find('input[type="file"]').click())
                $element.find('.preview-image').hide()

                showAddedValue = function (val) {
                    let index = addValue(val)

                    let $imageGroup = $(`<div class="group" style="position: relative; width: max-content; height: max-content; margin-right: 1rem; margin-top: 1rem;">
                        <img src="${val}" style="max-width: 100%; max-height: 15rem; border-radius: 0.375rem; border: 1px solid var(--cui-input-border-color, #b1b7c1); cursor: pointer;">
                        <svg class="icon close">
                            <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-x"></use>
                        </svg>
                    </div>`)

                    $imageGroup.find('img').click(function () { viewImage($(this).attr('src')) })

                    $imageGroup.find('.close').css({
                        position: 'absolute',
                        right: '20px',
                        top: '20px',
                        color: 'white',
                        cursor: 'pointer',
                        'border-radius': '50%',
                        padding: '0.3rem',
                        height: '2rem',
                        width: '2rem',
                        'background-color': 'black'
                    })
                    .click(() => {
                        removeValue(index)
                        $imageGroup.remove()

                        if ($element.find('.preview-image .group').length == 0) {
                            $element.find('.input-group').show()
                            $element.find('.preview-image').hide()
                        }
                    })

                    $element.find('.preview-image').show()
                    .find('.images').append($imageGroup)

                    $element.find('.input-group').hide()
                }

                $element.find('input[type="file"]').change(function () {
                    let input = this
                    if (input.files && input.files[0]) {
                        var reader = new FileReader();
                        reader.onload = (e) => {
                            resizeImage(e.target.result, imageMaxSizes).then(showAddedValue)
                        }
                        reader.readAsDataURL(input.files[0])
                        input.value = ''
                    }
                })

                break
        }

        if (value != '') {
            value.split(multiValueDelimiter).forEach(v => showAddedValue(v))
        }

        let counterInitEnd = counter

        validate = () => true
        getValue = () => range(counter + 1).filter(i => mapIndexToValue[i]).map(i => mapIndexToValue[i]).join(multiValueDelimiter)
        valueChanged = () => range(counterInitEnd + 1, counter + 1).some(i => mapIndexToValue[i])
    }
    else {
        switch (type) {
            case 'STRING':
                $element = $(`<div class="col-12">
                    <label for="${labelId}" class="form-label">${name}${code == 'callname' ? '<span style="color: red;"> *</span>' : ''}</label>
                    <input type="text" class="form-control" id="${labelId}" ${placeholder ? `placeholder="${placeholder}"` : ''} ${value ? `value="${value}"` : ''}>
                    <div class="invalid-feedback"></div>
                </div>`)
                $element.find('input').keydown(() => {
                    $element.find('.invalid-feedback').hide()
                    $element.find('input').removeClass('is-invalid')
                })
                validate = () => {
                    if (code == 'callname' && $element.find('input').val() == '') {
                        $element.find('.invalid-feedback').show().html('Không được để trống thông tin này!')
                        $element.find('input').addClass('is-invalid')
                        return false
                    }
                    return true
                }
                getValue = () => $element.find('input').val()
                valueChanged = () => value != getValue()
                break
            case 'DATE':
                $element = $(`<div class="col-md-12">
                    <label for="${labelId}" class="form-label">${name}</label>
                    <input type="text" class="form-control" id="${labelId}" ${placeholder ? `placeholder="${placeholder}"` : 'placeholder="Ngày dương lịch định dạng NGÀY/THÁNG/NĂM"'} ${value ? `value="${value}"` : ''}>
                    <div class="invalid-feedback"></div>
                </div>`)
                $element.find('input').keydown(() => {
                    $element.find('.invalid-feedback').hide()
                    $element.find('input').removeClass('is-invalid')
                })
                validate = () => {
                    let val = $element.find('input').val()
                    if (val == '') return true

                    let [isValid, message] = dateValidation(val)

                    if (isValid) {
                        return true
                    }

                    $element.find('.invalid-feedback').show().html(message)
                    $element.find('input').addClass('is-invalid')

                    return false
                }
                getValue = () => {
                    let val = $element.find('input').val()
                    return val == '' ? '' : DateLib.shortenDateString(val)
                }
                valueChanged = () => value != getValue()
                break
            case 'LUNAR_DATE':
                let id1 = randomId(), id2 = randomId(), rdName = randomId()
                $element = $(`<div class="col-md-12">
                    <label for="${labelId}" class="form-label">${name}</label>
                    <div class="row" style="margin: 0;">
                        <div class="form-check col-md-6">
                            <input class="form-check-input" type="radio" id="${id1}" name="${rdName}">
                            <label class="form-check-label" for="${id1}">
                                Dương lịch
                            </label>
                        </div>
                        <div class="form-check col-md-6">
                            <input class="form-check-input" type="radio" id="${id2}" name="${rdName}" checked>
                            <label class="form-check-label" for="${id2}">
                                Âm lịch
                            </label>
                        </div>
                    </div>
                    <input type="text" class="form-control" id="${labelId}" ${placeholder ? `placeholder="${placeholder}"` : 'placeholder="Ngày âm lịch định dạng NGÀY/THÁNG/NĂM"'} ${value ? `value="${value}"` : ''}>
                    <div class="invalid-feedback"></div>
                </div>`)

                let $input = $element.find(`#${labelId}`)
                let $feedBack = $element.find('.invalid-feedback')

                $input.keydown(() => {
                    $feedBack.hide()
                    $input.removeClass('is-invalid')
                })

                $element.find(`#${id1}`).click(() => {
                    $input.attr('placeholder', 'Ngày dương lịch định dạng NGÀY/THÁNG/NĂM')
                    $feedBack.hide()
                    $input.removeClass('is-invalid')
                })
                $element.find(`#${id2}`).click(() => {
                    $input.attr('placeholder', 'Ngày âm lịch định dạng NGÀY/THÁNG/NĂM')
                    $feedBack.hide()
                    $input.removeClass('is-invalid')
                })
                validate = () => {
                    let val = $input.val()
                    if (val == '') return true
                    let isLunarDate = $element.find(`#${id2}`)[0].checked

                    let [isValid, message] = dateValidation(val, isLunarDate, true)

                    if (isValid) return true

                    $feedBack.show().html(message)
                    $input.addClass('is-invalid')
                    return false
                }
                getValue = () => {
                    let val = $input.val()
                    if (val == '') return ''
                    let isLunarDate = $element.find(`#${id2}`)[0].checked

                    return DateLib.shortenDateString(isLunarDate ? val : DateLib.dateToLunarDate(val))
                }
                valueChanged = () => value != getValue()
                break
            case 'GENDER':
                let alertText = ''
                if (!value) {
                    // Add person mode
                    alertText = 'Đây là thuộc tính quan trọng, ảnh hưởng đến hầu hết các chức năng của trang web!'
                } else {
                    // Edit person mode
                    alertText = 'Nếu giới tính bị thay đổi, mối quan hệ (bố / mẹ) của con cái người này sẽ bị xóa!'
                }
                let id3 = randomId(), id4 = randomId(), rdName2 = randomId()
                $element = $(`<div class="col-12">
                    <label for="${labelId}" class="form-label">${name} <span style="color: red;">*</span></label><br>
                    <h6 class="text-muted" style="margin-top: -0.5rem; margin-bottom: 1rem;">(${alertText})</h6>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="${rdName2}" id="${id3}" value="option1" ${disabled ? 'disabled' : ''}>
                        <label class="form-check-label" for="${id3}">
                            Nam
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="${rdName2}" id="${id4}" value="option2" ${disabled ? 'disabled' : ''}>
                        <label class="form-check-label" for="${id4}">
                            Nữ
                        </label>
                    </div>
                </div>`)
                if (value == 'Nữ') {
                    $element.find(`#${id4}`)[0].checked = true
                } else {
                    $element.find(`#${id3}`)[0].checked = true
                }
                validate = () => true
                getValue = () => $element.find(`#${id4}`)[0].checked ? 'Nữ' : 'Nam'
                valueChanged = () => value != getValue()
                break
            case 'PERSON':
                $element = $(`<div class="col-md-6">
                    <label for="${labelId}" class="form-label">${name}</label>
                    <div class="input-group" style="position: relative;">
                        <input type="text" class="form-control" value="Chọn..." readonly style="cursor: pointer;">
                        <button class="btn btn-outline-secondary" type="button" style="border-radius: var(--cui-btn-border-radius); border-top-left-radius: 0; border-bottom-left-radius: 0;" ${disabled ? 'disabled' : ''}>Chọn</button>
                        <div class="show-choosed-person" style="position: absolute; top: 0; bottom: 0; display: flex; align-items: center; z-index: 5;">
                            <img src="" style="height: 100%; padding: 0.6rem; margin: 0 0.2rem;" class="my-img">
                            <div class="name"></div>
                        </div>
                    </div>
                </div>`)
                $element.find('div.show-choosed-person').hide()
                $element.find('label').click(() => {
                    if (!choosedPersonId) $element.find('button').click()
                })
                let choosedPersonId = ''
                function displayChoosedPerson([person]) {
                    if (!person) return
                    choosedPersonId = person.id
                    $element.find('button').html('Xóa')
                    $element.find('div.show-choosed-person img').attr('src', person.avatar || defaultAvatarUrl)
                    $element.find('div.show-choosed-person .name').html(person.callname)
                    $element.find('div.show-choosed-person').show()
                    $element.find('input').addClass('show-choosed-person').val('')
                }
                $element.find('button').click(() => {
                    if (choosedPersonId != '') {
                        $element.find('button').html('Chọn')
                        choosedPersonId = ''
                        $element.find('input').val('Chọn...')
                        $element.find('div.show-choosed-person').hide()
                        $element.find('input').removeClass('show-choosed-person')
                    } else {
                        popUpPickPerson(displayChoosedPerson, {
                            isMultiValue,
                            maleOnly: code == 'father' ? true : false,
                            femaleOnly: code == 'mother' ? true : false,
                            exceptIds: (personId && ['father', 'mother', 'spouse'].includes(code)) ? [personId] : []
                        })
                    }
                })
                if (value && value != '') {
                    $element.find('input').val('Đang tải...')
                    $element.find('button').hide()
                    api.getPersonBaseInfo({id: value}).then(result => {
                        $element.find('input').val('Chọn...')
                        $element.find('button').show()
                        displayChoosedPerson([result])
                    })
                }
                validate = () => true
                getValue = () => choosedPersonId
                valueChanged = () => value != getValue()
                break
            case 'IMAGE':
                $element = $(`<div class="col-12">
                    <label for="${labelId}" class="form-label">${name}</label>
                    <div class="input-group mb-3">
                        <button class="btn btn-outline-secondary add-image" type="button">Tải ảnh lên</button>
                        <input type="text" class="form-control" id="${labelId}" value="Chưa có ảnh được chọn" readonly style="cursor: pointer">
                    </div>
                    <input type="file" style="display:none;" accept="image/*">
                    <div class="preview-image" style="">
                        <img src="" style="max-width: 100%; max-height: 15rem; border-radius: 0.375rem; border: 1px solid var(--cui-input-border-color, #b1b7c1); cursor: pointer;">
                        <button type="button" class="btn btn-danger delete-photo" style="display:block; margin-top: 1rem;">Xóa ảnh</button>
                    </div>
                </div>`)
                let imageUrl = ''

                $element.find('button.add-image').click(() => $element.find('input[type="file"]').click())
                $element.find('.preview-image').hide()
                $element.find('.preview-image img').click(function () { viewImage($(this).attr('src')) })

                $element.find('button.delete-photo').click(() => {
                    imageUrl = ''
                    $element.find('.input-group').show()
                    $element.find('.preview-image').hide()
                })
                function chooseImage(_imgUrl) {
                    imageUrl = _imgUrl
                    $element.find('.preview-image').show()
                        .find('img').attr('src', imageUrl)

                    $element.find('.input-group').hide()
                }
                $element.find('input[type="file"]').change(function () {
                    let input = this
                    if (input.files && input.files[0]) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            imageUrl = e.target.result
                            resizeImage(imageUrl, imageMaxSizes).then(chooseImage)
                            input.value = ''
                        };
                        reader.readAsDataURL(input.files[0])
                    }
                })
                if (value) {
                    chooseImage(value)
                }

                validate = () => true
                getValue = () => imageUrl
                valueChanged = () => value != getValue()

                break
        }
    }

    let getValue2 = () => {
        return {
            value: getValue(),
            id, code
        }
    }

    let fieldDeleted = false

    let valueChanged2 = () => {
        if (fieldDeleted) return false
        return valueChanged()
    }

    if (!code) { // Custom field, so can be changed
        let $label = $element.find(`label[for="${labelId}"]`)

        function assignOperations() {
            let $operations = $(`<div style="display: inline-block; margin-left: 1rem;">
                <svg class="icon me-2 edit"><use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-pen-alt"></use></svg>
            </div>`)
            .click(e => {
                e.preventDefault()
                e.stopPropagation()
            })

            $operations.find('svg').css({
                cursor: 'pointer'
            })

            $operations.find('svg.edit').click(() => {
                popUpEditField({id, name, description, isForAllPeople}, (newField) => {
                    let deleted = newField.deleted
                    if (deleted) {
                        fieldDeleted = true
                        $element.remove()
                        updateFieldDefinitionCallback(isForAllPeople)
                        return
                    }

                    name = newField.name
                    description = newField.description

                    // Handle description
                    // ....
                    
                    $label.html(newField.name)
                    assignOperations()

                    updateFieldDefinitionCallback(isForAllPeople)
                })
            })

            $label.append($operations)
        }

        assignOperations()
    }

    return [$element, validate, getValue2, valueChanged2]
}

function popUpEditPerson(fieldValues, personId, updateSuccessCallback) {
    let fieldFactoryReturnedValues = []
    let hasNewFieldsForAllPeople = false
    let hasNewFieldForPerson = false

    function updateFieldDefinitionCallback(fieldDefUpdatedForAllPerson) {
        hasNewFieldForPerson = true
        hasNewFieldsForAllPeople = hasNewFieldsForAllPeople || fieldDefUpdatedForAllPerson
    }
    bigPopUp('', {
        zIndex: 110000,
        script: $popUp => {
            fieldValues = makeCopy(fieldValues)
            fieldValues.find(({code}) => code == 'gender').type = 'GENDER'
            let $from = $('<form class="row g-3"></form>')
            fieldFactoryReturnedValues = fieldValues.map(fV => FieldInput$ElementFactory(fV, updateFieldDefinitionCallback))
            $from.append(fieldFactoryReturnedValues.map(i => i[0]))

            let $addField = $(`<div class="col-12" style="margin-top: 5rem;">
                <button type="button" class="btn btn-light"><svg class="icon me-2"><use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-plus"></use></svg> Thêm trường thông tin</button>
            </div>`)
            $addField.find('button').click(() => {
                popUpAddField(personId, function addFieldSuccessCallback(newFieldDef) {
                    hasNewFieldsForAllPeople = newFieldDef.isForAllPeople
                    hasNewFieldForPerson = true

                    let temp = FieldInput$ElementFactory(newFieldDef, updateFieldDefinitionCallback)
                    $addField.before(temp[0])
                    fieldFactoryReturnedValues.push(temp)
                })
            })
            $from.append($addField)
        
            $popUp.find('.content').append($from)
        },
        hideCloseButton: true,
        buttons: [
            {
                html: 'Thoát',
                click: $popUp => {
                    if (hasNewFieldForPerson) {
                        updateSuccessCallback(personId, [], false, true, hasNewFieldsForAllPeople)
                    }
                    $popUp.remove()
                }
            },
            {
                html: 'Lưu thay đổi',
                type: 'success',
                click: $popUp => {
                    if (fieldFactoryReturnedValues.every(i => i[1]())) { // All fields valid
                        let filterChanged = fieldFactoryReturnedValues.filter(i => i[3]())
                        function updateSuccess(valuesChanged = true) {
                            $popUp.remove()
                            if (valuesChanged) {
                                let updateRelationShip = fieldValues.some(({code}) => ['father', 'mother', 'gender'].includes(code))
                                updateSuccessCallback(personId, fieldValues, updateRelationShip, hasNewFieldForPerson, hasNewFieldsForAllPeople)
                            }
                        }

                        if (filterChanged.length == 0) {
                            if (hasNewFieldForPerson) {
                                $popUp.remove()
                                updateSuccessCallback(personId, [], false, true, hasNewFieldsForAllPeople)
                                return
                            }
                            updateSuccess(false)
                            return
                        }

                        let fieldValues = filterChanged.map(i => i[2]())
                        if (fieldValues.some(({code}) => code == 'gender')) {
                            popUpConfirm('Bạn có chắc chắn muốn thay đổi giới tính không? Nếu thay đổi, những mối quan hệ bố/mẹ của người này với con cái của họ sẽ bị xóa!', doUpdate)
                            return
                        }

                        doUpdate()

                        function doUpdate() {
                            let data = fieldValues.map(fV => {
                                let newObj = Object.assign(fV, {personId})
                                newObj.fieldDefinitionId = newObj.id
                                newObj.fieldDefinitionCode = newObj.code
                                
                                Object.keys(newObj).forEach(key => {
                                    if (!['fieldDefinitionId', 'value', 'personId', 'fieldDefinitionCode', 'code'].includes(key)) {
                                        delete newObj[key]
                                    }
                                })
    
                                return newObj
                            })
                            
                            api.updateFieldValues({data}).then(updateSuccess)
                        }
                    }
                }
            }
        ]
    })
}

let updateCallbackStack = []
function popUpViewPerson(person, updateCallbackIndex, zIndex = popUpViewPersonBaseZIndex, firstTime = false) {
    let {callname, gender, birthday, deathday, avatar, id} = person
    let showedPersonId = id
    let html = `
        <div class="row" style="margin-bottom: 3rem;">
            <div class="col-md-4" style="display: flex; justify-content: center; align-items: center;">
                <img src="${avatar || defaultAvatarUrl}" alt="" class="my-img" style="height: 12rem;">
            </div>
            <div class="col-md-8" style="display: flex; align-items: center;">
                <div class="row">
                    <div class="col-md-12">
                        <h1>${callname}</h1>
                        <h4>Giới tính: ${gender}</h4>
                        <h4>Ngày sinh: ${birthday || 'Không rõ'}</h4>
                        <h4>Ngày mất: ${deathday ? `${DateLib.lunarDateToDate(deathday)} (${deathday} âm lịch)` : 'Không rõ'}</h4>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-4 col-md-5">
                <table class="table border mb-0 relative-people">
                    <thead class="table-light fw-semibold">
                        <tr class="align-middle">
                            <th class="text-center">
                            <svg class="icon">
                                <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-people"></use>
                            </svg>
                            </th>
                            <th>Người thân</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="loading">
                            <td></td>
                            <td>Đang tải...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="row col-md-8 fields" style="margin: 0 -0.7rem;">
            
            </div>
        </div>
    `

    updateCallbackStack[updateCallbackIndex + 1] = function _updateCallback(personId, fieldValuesChanged, updateRelationShip, updatedPersonHasNewField = false, allPersonHasNewField = false) {
        // personId: id of target person that being updated 
        // fieldValuesChanged: array of field values changed
        // updateRelationShip: does updated person has relation ships changed (change father or mother)
        // updatedPersonHasNewField: Has a filed being added to updated person
        // allPersonHasNewField: Has a filed being added to all person

        updateCallbackStack[updateCallbackIndex](personId, fieldValuesChanged, updateRelationShip, false, allPersonHasNewField)

        // Completely refresh
        if (updatedPersonHasNewField || allPersonHasNewField || updateRelationShip || (personId == showedPersonId)) {
            $popUp.remove()
            updateCallbackStack[updateCallbackIndex + 1] = null

            let newPopUpClosed = false
            bigPopUp('', {
                zIndex,
                script: ($popUp, _, removeCallBack) => {
                    api.getPersonBaseInfo({id: showedPersonId}).then(person => {
                        if (newPopUpClosed) return
                        $popUp.remove()
                        removeCallBack()
                        popUpViewPerson(person, updateCallbackIndex, zIndex, firstTime)
                    })
                },
                closeCallBack: () => {
                    if (firstTime) $(document.body).removeClass('stop-scrolling')
                    updateCallbackStack.pop()
                }
            })

            return
        }

        let newPerson = {id: personId}
        fieldValuesChanged.forEach(({code, value}) => {
            newPerson[code] = value
        })

        $popUp.find('.person-reference-wrap').each((index, elem) => {
            elem.updateCallback(newPerson)
        })
    }
    
    let fieldValuesFull = null
    let $popUp = bigPopUp(html, {
        zIndex,
        script: ($popUp) => {
            let $editButton = null
            $popUp.find('button').each((index, button) => {
                let $button = $(button)
                if ($button.find('svg').length != 0 && $button.html().includes('Chỉnh sửa thông tin')) {
                    $editButton = $button
                }
            })
            $editButton.hide()

            api.getPersonDetailInfo({id}).then(({id, father, mother, spouse, fieldValues, siblings, children}) => {
                fieldValuesFull = [...fieldValues]
                $editButton.show()

                fieldValues = fieldValues.filter(({fieldDefinitionCode}) => !fieldDefinitionCode)
                $popUp.find('.relative-people tbody .loading').remove()
                
                let parts = [], texts = []
                if (spouse) {
                    parts.push([spouse])
                    texts.push('Vợ / Chồng')
                }
                if (father || mother) {
                    let {sameFather, sameMother} = siblings
                    if (father) {
                        parts.push([father])
                        texts.push('Bố')
                    }
                    if (mother) {
                        parts.push([mother])
                        texts.push('Mẹ')
                    }

                    let sameFatherIds = sameFather.map(({id}) => id)
                    let sameMotherIds = sameMother.map(({id}) => id)
                    let sameFatherIdsSet = new Set(sameFatherIds)
                    let sameMotherIdsSet = new Set(sameMotherIds)

                    let sameFatherOnly = sameFather.filter(({id}) => !sameMotherIdsSet.has(id))
                    let sameMotherOnly = sameMother.filter(({id}) => !sameFatherIdsSet.has(id))
                    let sameBothFatherAndMother = sameFather.filter(({id}) => sameMotherIdsSet.has(id) && id != showedPersonId)

                    parts.push(sameBothFatherAndMother, sameFatherOnly, sameMotherOnly)
                    texts.push('Anh em', 'Anh em cùng cha khác mẹ', 'Anh em cùng mẹ khác cha')
                } else if (children.length == 0 && (!spouse)) {
                    $popUp.find('.relative-people tbody').append(`<tr>
                        <td></td>
                        <td>Không có thông tin</td>
                    </tr>`)
                }

                parts.push(children)
                texts.push('Con ruột')

                parts.forEach((part, i) => {
                    part.forEach(relPerson => {
                        let {avatar, id, callname} = relPerson

                        let $element = $(`<tr style="cursor: pointer;" class="person-reference-wrap">
                            <td class="text-center">
                                <div class="avatar avatar-md">
                                    <img class="avatar-img my-img person-reference-img" src="${avatar || defaultAvatarUrl}">
                                </div>
                            </td>
                            <td>
                                <div class="person-reference-callname">${callname}</div>
                                <div class="small text-medium-emphasis">${texts[i]}</div>
                            </td>
                        </tr>`)
                        .click(() => popUpViewPerson(relPerson, updateCallbackIndex + 1, zIndex + 1))
                        .on('mouseenter', function () { $(this).css('background-color', '#f7f7f9') })
                        .on('mouseleave', function () { $(this).css('background-color', 'white') })

                        $popUp.find('.relative-people tbody').append($element)

                        $element[0].updateCallback = (newPerson) => {
                            if (newPerson.id != id) return
                            Object.assign(relPerson, newPerson)

                            $element.find('.person-reference-img').attr('src', newPerson.avatar || defaultAvatarUrl)
                            $element.find('.person-reference-callname').html(newPerson.callname)
                        }
                    })
                })

                fieldValues.forEach(fieldValue => {
                    $popUp.find('.row > .fields').append(FieldValueDisplay$ElementFactory(Object.assign(fieldValue, { personTypeAdditionalInfo: {updateCallbackIndex: updateCallbackIndex + 1, zIndex: zIndex + 1} })))
                })
            })
        },
        closeCallBack: () => {
            if (firstTime) $(document.body).removeClass('stop-scrolling')
            updateCallbackStack.pop()
        },
        buttons: [{
            html: '<svg class="icon me-2"><use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-pen-alt"></use></svg> Chỉnh sửa thông tin',
            type: 'info',
            click: () => popUpEditPerson(fieldValuesFull, id, updateCallbackStack[updateCallbackIndex + 1])
        }]
    })
}

function FieldValueDisplay$ElementFactory({id, code, type, placeholder, name, isMultiValue, value, personTypeAdditionalInfo}) {
    // updateCallback for PERON type only
    value = value || ''
    let $element
    let randomId = () => `${Math.round(Math.random()*10E12)} r o t c e n o C y l i m a F`.split(' ').reverse().join('')
    let labelId = randomId()

    if (isMultiValue) {
        switch (type) {
            case 'STRING':
                $element = $(`<div style="padding: 0.7rem; width: max-content;">
                    <div class="card" style="width: 18rem;">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><h5 style="margin-top: 0.5rem;">${name}</h5></li>
                            ${value == '' ? '<li class="list-group-item"><h6 class="text-muted">Không có giá trị nào!</h6></li>' : ''}
                            ${value != '' ? value.split(multiValueDelimiter).map(v => `<li class="list-group-item">${v}</li>`).join('') : ''}
                        </ul>
                    </div>
                </div>`)
                break
            case 'DATE':
                $element = $(`<div style="padding: 0.7rem; width: max-content;">
                    <div class="card" style="width: 18rem;">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><h5 style="margin-top: 0.5rem;">${name}</h5></li>
                            ${value == '' ? '<li class="list-group-item"><h6 class="text-muted">Không có giá trị nào!</h6></li>' : ''}
                            ${value != '' ? value.split(multiValueDelimiter).map(v => `<li class="list-group-item">${v}</li>`).join('') : ''}
                        </ul>
                    </div>
                </div>`)
                break
            case 'LUNAR_DATE':
                $element = $(`<div style="padding: 0.7rem; width: max-content;">
                    <div class="card" style="width: 18rem;">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><h5 style="margin-top: 0.5rem;">${name}</h5></li>
                            ${value == '' ? '<li class="list-group-item"><h6 class="text-muted">Không có giá trị nào!</h6></li>' : ''}
                            ${value != '' ? value.split(multiValueDelimiter).map(v => `<li class="list-group-item">${DateLib.lunarDateToDate(v)} ~ ${v} âm lịch</li>`).join('') : ''}
                        </ul>
                    </div>
                </div>`)
                break
            case 'PERSON':
                $element = $(`<div style="padding: 0.7rem; width: max-content;">
                    <div class="card" style="width: 18rem;">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><h5 style="margin-top: 0.5rem;">${name}</h5></li>
                            ${value == '' ? '<li class="list-group-item"><h6 class="text-muted">Không có người nào cả!</h6></li>' : ''}
                        </ul>
                    </div>
                </div>`)

                value.split(multiValueDelimiter).forEach(id => {
                    if (id == '') return

                    let $person = $(`<li class="list-group-item person-reference-wrap" style="cursor: pointer;">
                        <div class="person" style="display: flex; align-items: center;">
                            <img src="" class="my-img person-reference-image" style="display: none; height: 2.5rem; margin-right: 1.25rem;">
                            <div class="name person-reference-callname" style="display: none;"></div>
                            <div class="loading">Đang tải...</div>
                        </div>
                    </li>`)

                    $element.find('.card .list-group').append($person)

                    api.getPersonBaseInfo({id}).then(person => {
                        $person.find('.loading').remove()
                        $person.find('img').attr('src', person.avatar || defaultAvatarUrl).show()
                        $person.find('.name').html(person.callname).show()
    
                        $person.click(() => popUpViewPerson(person, personTypeAdditionalInfo.updateCallbackIndex, personTypeAdditionalInfo.zIndex))
                            .on('mouseenter', function () { $(this).css('background-color', '#f7f7f9') })
                            .on('mouseleave', function () { $(this).css('background-color', 'white') })

                        $person[0].updateCallback = (newPerson) => {
                            if (newPerson.id != id) return
                            Object.assign(person, newPerson)
    
                            $element.find('.person-reference-img').attr('src', newPerson.avatar || defaultAvatarUrl)
                            $element.find('.person-reference-callname').html(newPerson.callname)
                        }
                    })
                })
                break
            case 'IMAGE':
                $element = $(`<div style="padding: 0.7rem; width: 100%;">
                    <div class="card" style="width: 100%;">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><h5 style="margin-top: 0.5rem;">${name}</h5></li>
                            ${value == '' ? '<li class="list-group-item"><h6 class="text-muted">Không có ảnh nào cả!</h6></li>' : ''}
                        </ul>
                    </div>
                </div>`)

                if (value != '') {
                    let $imgs = $(`<li class="list-group-item">
                        <div class="images row" style="margin: 0 -0.5rem;"></div>
                    </li>`)
                    value.split(multiValueDelimiter).forEach(src => {
                        let $imgWrap = $(`<div style="padding: 0.5rem; width: max-content;">
                            <img src="${src}" style="max-height: 5rem; max-width: 10rem; object-fit: cover; cursor: pointer; border-radius: 0.375rem; border: 1px solid var(--cui-input-border-color, #b1b7c1); cursor: pointer;">
                        </div>`)
                        
                        $imgWrap.find('img').click(function () { viewImage(this.src) })

                        $imgs.find('.images').append($imgWrap)
                    })

                    $element.find('.card > ul').append($imgs)
                }
                break
        }
    }
    else {
        switch (type) {
            case 'STRING':
                $element = $(`<div style="padding: 0.7rem; width: max-content;">
                    <div class="card" style="width: 18rem;">
                        <div class="card-body">
                            <h5 class="card-title">${name}</h5>
                            ${value == '' ?
                                '<h6 class="text-muted">Không có giá trị!</h6>' : 
                                `<p class="card-text">${value}</p>`
                            }
                        </div>
                    </div>
                </div>`)
                break
            case 'DATE':
                $element = $(`<div style="padding: 0.7rem; width: max-content;">
                    <div class="card" style="width: 18rem;">
                        <div class="card-body">
                            <h5 class="card-title">${name}</h5>
                            ${value == '' ?
                                '<h6 class="text-muted">Không có giá trị!</h6>' : 
                                `<p class="card-text">${value}</p>`
                            }
                        </div>
                    </div>
                </div>`)
                break
            case 'LUNAR_DATE':
                $element = $(`<div style="padding: 0.7rem; width: max-content;">
                    <div class="card" style="width: 18rem;">
                        <div class="card-body">
                            <h5 class="card-title">${name}</h5>
                            ${value == '' ?
                                '<h6 class="text-muted">Không có giá trị!</h6>' : 
                                `<p class="card-text">${DateLib.lunarDateToDate(value)}</p><h6 class="card-subtitle mb-2 text-muted">${value} âm lịch</h6>`
                            }
                        </div>
                    </div>
                </div>`)
                break
            case 'PERSON':
                $element = $(`<div style="padding: 0.7rem; width: max-content;">
                    <div class="card" style="width: 18rem;">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><h5 style="margin-top: 0.5rem;">${name}</h5></li>
                            ${value == '' ? '<li class="list-group-item"><h6 class="text-muted">Không có người nào cả!</h6></li>' : ''}
                            ${value != '' ? `<li class="list-group-item person-wrap person-reference-wrap" style="cursor: pointer;">
                                <div class="person" style="display: flex; align-items: center;">
                                    <img src="" class="my-img person-reference-img" style="display: none; height: 2.5rem; margin-right: 1.25rem;">
                                    <div class="name person-reference-callname" style="display: none;"></div>
                                    <div class="loading">Đang tải...</div>
                                </div>
                            </li>` : ''}
                        </ul>
                    </div>
                </div>`)

                if (value != '') {
                    let $person = $element.find('.card .person-wrap')

                    api.getPersonBaseInfo({id: value}).then(person => {
                        $person.find('.loading').remove()
                        $person.find('img').attr('src', person.avatar || defaultAvatarUrl).show()
                        $person.find('.name').html(person.callname).show()
    
                        $person.click(() => popUpViewPerson(person, personTypeAdditionalInfo.updateCallbackIndex, personTypeAdditionalInfo.zIndex))
                            .on('mouseenter', function () { $(this).css('background-color', '#f7f7f9') })
                            .on('mouseleave', function () { $(this).css('background-color', 'white') })

                        $person[0].updateCallback = (newPerson) => {
                            if (newPerson.id != id) return
                            Object.assign(person, newPerson)
        
                            $element.find('.person-reference-img').attr('src', newPerson.avatar || defaultAvatarUrl)
                            $element.find('.person-reference-callname').html(newPerson.callname)
                        }
                    })
                }
                break
            case 'IMAGE':
                $element = $(`<div style="padding: 0.7rem; width: max-content;">
                    <div class="card" style="width: 18rem;">
                        <div class="card-body">
                            <h5 class="card-title">${name}</h5>
                            ${value == '' ? `<h6 class="card-subtitle mb-2 text-muted">Không có ảnh</h6>` : ''}
                        </div>
                        ${value != '' ? `<img class="card-img-bottom" src="${value}" style="cursor: pointer; max-width: 100%; max-height: 10rem; object-fit: cover;">` : ''}
                    </div>
                </div>`)
                $element.find('img').click(function () { viewImage(this.src) })
                break
        }
    }

    return $element
}

function load(user) {
    function tabPeopleManager() {
        $('#tab-people-manager').html(`
            <button type="button" class="btn btn-primary" style="margin-bottom: 12px;" id="add-person">
                <svg class="icon">
                <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-user-plus"></use>
                </svg> Thêm người thân
            </button>
            <table class="table border mb-0">
                <thead class="table-light fw-semibold">
                <tr class="align-middle">
                    <th class="text-center">
                    <svg class="icon">
                        <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-people"></use>
                    </svg>
                    </th>
                    <th>Tên gọi</th>
                    <th class="text-center">Giới tính</th>
                    <th class="text-center">Ngày sinh</th>
                    <th class="text-center">Ngày mất</th>
                    <th class="text-center">Vợ/Chồng</th>
                    <th class="text-center">Bố</th>
                    <th class="text-center">Mẹ</th>
                </tr>
                </thead>
                <tbody id="list-people">
                </tbody>
            </table>

            <style>
                #tab-people-manager table thead tr th {
                background-color: darkgray;
                }
                #tab-people-manager table tbody {
                background-color: white;
                }
            </style>
        `)

        function refreshPeopleList() {
            api.getPeopleOfUserBaseInfo().then(people => {
                $("#list-people").html('')
                people.forEach(person => {
                    let {callname, gender, birthday, deathday, father, mother, avatar, spouse} = person
                    let $person = $(`<tr class="align-middle" style="cursor: pointer;">
                        <td class="text-center">
                            <div class="avatar avatar-md">
                                <img class="avatar-img my-img" src="${avatar || defaultAvatarUrl}">
                            </div>
                        </td>
                        <td>
                            <div>${callname}</div>
                        </td>
                        <td class="text-center">
                            <div class="fw-semibold">${gender}</div>
                        </td>
                        <td class="text-center">
                            <div class="fw-semibold">${birthday || '-'}</div>
                        </td>
                        <td class="text-center">
                            <div class="fw-semibold">${deathday || '-'}</div>
                        </td>
                        <td class="text-center">
                            ${spouse ? `<div class="avatar avatar-md">
                                <img class="avatar-img my-img" src="${spouse.avatar || defaultAvatarUrl}">
                            </div>` : '-'}
                        </td>
                        <td class="text-center">
                            ${father ? `<div class="avatar avatar-md">
                                <img class="avatar-img my-img" src="${father.avatar || defaultAvatarUrl}">
                            </div>` : '-'}
                        </td>
                        <td class="text-center">
                            ${mother ? `<div class="avatar avatar-md">
                                <img class="avatar-img my-img" src="${mother.avatar || defaultAvatarUrl}">
                            </div>` : '-'}
                        </td>
                    </tr>`)
        
                    $("#list-people").append($person)
    
                    $person
                    .on('mouseenter', function () { $(this).css('background-color', '#f7f7f9') })
                    .on('mouseleave', function () { $(this).css('background-color', 'white') })
                    .click(() => {
                        $(document.body).addClass('stop-scrolling')
                        updateCallbackStack[0] = refreshPeopleList
                        popUpViewPerson(person, 0, popUpViewPersonBaseZIndex, true)
                    })
                })
            })
        }
    
        refreshPeopleList()
    
        $('#add-person').click(() => {
            $(document.body).addClass('stop-scrolling')
            popUpAddPerson(function addSuccessCallback () {
                refreshPeopleList()
            })
        })
    }
    tabPeopleManager() // First page

    function tabFamilyTree() {
        let config = {
            show: {
                image: true,
                name: true,
                gender: true,
                birthday: true,
                deathday: true
            },
            layout: {
                default: false,
                minWidth: true
            },
            targetPeople: {
                default: false,
                showWifes: false,
                hasRelationShipMainBranch: true,
                hasRelationShip: false
            },
            targetPersonId: null,
            focusPersonId: null,
            props: {
                default: {
                    height: 180,
                    width: 360
                },
                minWidth: {
                    height: 600,
                    width: 300
                },
                horizontalDistance: 80,
                verticalDistance: 120
            }
        }

        // let randomId = (() => {
        //     let x = 0
        //     return () => 'ID' + (Math.round(Math.sin(++x)*10000000))
        // })()

        let backupDataAncestor = null

        function createTree() {
            let $tab = $('#tab-family-tree')
                .append('<div style="height: 100%; width: 100%; position: relative; overflow: hidden;"></div>').find('div')
                .append('<div style="transform-origin: 0px 0px; left: 0; top: 0; position: absolute;"></div>').find('div')

            let props = config.props[config.layout.minWidth ? 'minWidth' : 'default']
            props.horizontalDistance = config.props.horizontalDistance
            props.verticalDistance = config.props.verticalDistance

            let $targetPersonCard = null
            let $focusPersonCard = null
            function createPersonCard(person) {
                let {id, callname, gender, birthday, deathday, father, mother, spouse, avatar, isStandForUser} = person

                let $card = $(`<div class="card" style="height: ${props.height}px; width: ${props.width}px; position: relative;">
                    <div class="row g-0" style="height: 100%;">
                        ${config.show.image ? `<div class="col-${config.layout.minWidth ? 12 : 4}" style="height: ${config.layout.minWidth ? 50 : 100}%;">
                            <img src="${avatar || defaultAvatarUrl}" class="img-fluid rounded-start" style="object-fit: cover; height: 100%; width: 100%;">
                        </div>` : ''}

                        ${(config.show.name || config.show.gender || config.show.birthday || config.show.deathday) ? `<div class="col-${config.layout.minWidth ? 12 : 8}">
                            <div class="card-body">
                                ${config.show.name ? `<h5 class="card-title">${callname}</h5>` : ''}
                                ${config.show.gender ? `<p class="card-text">${gender}</p>` : ''}
                                ${config.show.birthday ? `<p class="card-text"><small class="text-body-secondary">Ngày sinh: ${birthday || 'Không rõ'}</small></p>` : ''}
                                ${config.show.deathday ? `<p class="card-text"><small class="text-body-secondary">Ngày mất: ${deathday || 'Không rõ'}</small></p>` : ''}
                            </div>
                        </div>` : ''}
                    </div>

                    ${father ? '' : `<button type="button" class="btn btn-outline-secondary btn-sm showWhenHover add-father" style="z-index: 3; position: absolute; left: 0; bottom: calc(100% + 8px);">Thêm bố</button>`}
                    ${mother ? '' : `<button type="button" class="btn btn-outline-secondary btn-sm showWhenHover add-mother" style="z-index: 3; position: absolute; right: 0; bottom: calc(100% + 8px);">Thêm mẹ</button>`}
                    ${spouse ? '' : `<button type="button" class="btn btn-outline-secondary btn-sm showWhenHover add-spouse" style="z-index: 3; position: absolute; right: 0; top: calc(100% + 8px);">Thêm vợ/chồng</button>`}
                    <button type="button" class="btn btn-outline-secondary btn-sm showWhenHover add-child" style="z-index: 3; position: absolute; left: 0; top: calc(100% + 8px);">Thêm con</button>

                    <div class="showWhenHover" style="z-index: 2; position: absolute; width: 100%; left: 0; height: 2rem; bottom: 100%;"></div>
                    <div class="showWhenHover" style="z-index: 2; position: absolute; width: 100%; left: 0; height: 2rem; top: 100%;"></div>
                </div>`)

                if (id == config.targetPersonId) $targetPersonCard = $card
                if (id == config.focusPersonId) $focusPersonCard = $card

                $card.click(() => {
                    if (!isClickEvent()) return
                    updateCallbackStack[0] = () => {
                        $('#tab-family-tree').html('')
                        config.focusPersonId = id
                        createTree()
                    }
                    popUpViewPerson({id, callname, gender, birthday, deathday, avatar}, 0, popUpViewPersonBaseZIndex, true)
                })

                $card.find('.showWhenHover').hide()
                $card.mouseover(() => $card.find('.showWhenHover').show())
                $card.mouseleave(() => $card.find('.showWhenHover').hide())

                let tempHtml = `
                    <h3>Bạn muốn thêm <span style="color: #2eb85c;">ROLE</span> cho <span style="color: #2eb85c;">${callname}</span> bằng cách nào?</h3>
                    <div style="margin-top: 40px;" id="from-list"><button type="button" class="btn btn-primary">Chọn từ danh sách</button></div>
                    <div style="margin-top: 20px;" id="create-new"><button type="button" class="btn btn-primary">Tạo một người mới</button></div>
                `

                $card.find('button.add-father').click((e) => {
                    e.stopPropagation()
                    
                    bigPopUp(tempHtml.replace('ROLE', 'bố'), {
                        script: ($popUp) => {
                            $popUp.find('#from-list').click(() => {
                                popUpPickPerson(([person]) => {
                                    if (!person) return
                                    $popUp.remove()
                                    let removeLoading = popUpLoading()

                                    api.updateFieldValues({
                                        data: [{
                                            value: person.id,
                                            personId: id,
                                            fieldDefinitionCode: 'father'
                                        }]
                                    }).then(() => {
                                        removeLoading()
                                        $('#tab-family-tree').html('')
                                        config.focusPersonId = id
                                        createTree()
                                    })
                                }, {
                                    maleOnly: true,
                                    exceptIds: [id]
                                })
                            })

                            $popUp.find('#create-new').click(() => {
                                popUpAddPerson(() => {
                                    $popUp.remove()
                                    $('#tab-family-tree').html('')
                                    config.focusPersonId = id
                                    createTree()
                                }, {
                                    gender: 'Nam',
                                    target: id,
                                    asRole: 'father'
                                })
                            })
                        },
                        style: {
                            height: '600px',
                            width: '400px'
                        }
                    })
                })

                $card.find('button.add-mother').click((e) => {
                    e.stopPropagation()
                    
                    bigPopUp(tempHtml.replace('ROLE', 'mẹ'), {
                        script: ($popUp) => {
                            $popUp.find('#from-list').click(() => {
                                popUpPickPerson(([person]) => {
                                    if (!person) return
                                    $popUp.remove()
                                    let removeLoading = popUpLoading()

                                    api.updateFieldValues({
                                        data: [{
                                            value: person.id,
                                            personId: id,
                                            fieldDefinitionCode: 'mother'
                                        }]
                                    }).then(() => {
                                        removeLoading()
                                        $('#tab-family-tree').html('')
                                        config.focusPersonId = id
                                        createTree()
                                    })
                                }, {
                                    femaleOnly: true,
                                    exceptIds: [id]
                                })
                            })

                            $popUp.find('#create-new').click(() => {
                                popUpAddPerson(() => {
                                    $popUp.remove()
                                    $('#tab-family-tree').html('')
                                    config.focusPersonId = id
                                    createTree()
                                }, {
                                    gender: 'Nữ',
                                    target: id,
                                    asRole: 'mother'
                                })
                            })
                        },
                        style: {
                            height: '600px',
                            width: '400px'
                        }
                    })
                })

                $card.find('button.add-spouse').click((e) => {
                    e.stopPropagation()
                    
                    bigPopUp(tempHtml.replace('ROLE', 'mẹ'), {
                        script: ($popUp) => {
                            $popUp.find('#from-list').click(() => {
                                popUpPickPerson(([person]) => {
                                    if (!person) return
                                    $popUp.remove()
                                    let removeLoading = popUpLoading()

                                    api.updateFieldValues({
                                        data: [{
                                            value: person.id,
                                            personId: id,
                                            fieldDefinitionCode: 'spouse'
                                        }]
                                    }).then(() => {
                                        removeLoading()
                                        $('#tab-family-tree').html('')
                                        config.focusPersonId = id
                                        createTree()
                                    })
                                }, {
                                    exceptIds: [id]
                                })
                            })

                            $popUp.find('#create-new').click(() => {
                                popUpAddPerson(() => {
                                    $popUp.remove()
                                    $('#tab-family-tree').html('')
                                    config.focusPersonId = id
                                    createTree()
                                }, {
                                    target: id,
                                    asRole: 'spouse'
                                })
                            })
                        },
                        style: {
                            height: '600px',
                            width: '400px'
                        }
                    })
                })

                $card.find('button.add-child').click((e) => {
                    e.stopPropagation()
                    
                    bigPopUp(tempHtml.replace('ROLE', 'con'), {
                        script: ($popUp) => {
                            $popUp.find('#from-list').click(() => {
                                popUpPickPerson(([person]) => {
                                    if (!person) return
                                    $popUp.remove()
                                    let removeLoading = popUpLoading()

                                    api.updateFieldValues({
                                        data: [{
                                            value: id,
                                            personId: person.id,
                                            fieldDefinitionCode: (gender == 'Nam') ? 'father' : 'mother'
                                        }]
                                    }).then(() => {
                                        removeLoading()
                                        $('#tab-family-tree').html('')
                                        config.focusPersonId = id
                                        createTree()
                                    })
                                }, {
                                    exceptIds: [id]
                                })
                            })

                            $popUp.find('#create-new').click(() => {
                                popUpAddPerson(() => {
                                    $popUp.remove()
                                    $('#tab-family-tree').html('')
                                    config.focusPersonId = id
                                    createTree()
                                }, {
                                    target: id,
                                    asRole: 'child',
                                    targetGender: gender
                                })
                            })
                        },
                        style: {
                            height: '600px',
                            width: '400px'
                        }
                    })
                })

                return $card
            }

            let drawLineCallbacks = []
            function createFamilyGroup(person) {
                let id1 = randomId()
                let id2 = randomId()
                let id3 = randomId()
                let id4 = randomId()

                let $group = $(`<div class="">
                    <div class="parent" id="${id1}"></div>
                    <div class="children" id="${id2}"></div>
                </div>`)
                .css({
                    padding: (props.horizontalDistance/2) + 'px',
                    width: 'max-content',
                    position: 'relative'
                })
                $group.find('#'+id1).css({
                    display: 'flex',
                    'justify-content': 'center'
                })
                $group.find('#'+id2).css({
                    display: 'flex',
                    width: 'max-content',
                    'margin-top': (props.verticalDistance - props.horizontalDistance/2) + 'px'
                })

                let $card = createPersonCard(person).attr('id', id3)
                $group.find('#'+id1).append($card)

                let allChildren = person.children || []
                let allChildrenCardId = []
                let childrenNotHasPartner = allChildren.filter(({partner}) => !partner)
                let childrenNotHasPartnerCardId = []
                let childrenHasPartnerSameSpouse = allChildren.filter(({partner}) => partner && partner.id == person.spouse?.id)
                let childrenHasPartnerSameSpouseCardId = []
                let childrenHasPartnerDiffFromSpouse = allChildren.filter(({partner}) => partner && partner.id != person.spouse?.id)
                let groupChildrenHasPartnerDiffFromSpouse = {}
                childrenHasPartnerDiffFromSpouse.forEach(({partner, child}) => {
                    let id = partner.id
                    if (groupChildrenHasPartnerDiffFromSpouse[id]) {
                        groupChildrenHasPartnerDiffFromSpouse[id].children.push(child)
                    } else {
                        groupChildrenHasPartnerDiffFromSpouse[id] = {
                            children: [child],
                            partner
                        }
                    }
                })
                let idsOfPartnersDiffFromSpouse = Object.keys(groupChildrenHasPartnerDiffFromSpouse)
                let mapPartnerIdToCardId = {}
                let mapPartnerIdToChildrenCardId = {}
                idsOfPartnersDiffFromSpouse.forEach(id => mapPartnerIdToChildrenCardId[id] = [])

                childrenNotHasPartner.forEach(({child}) => {
                    let $childCard = createFamilyGroup(child)
                    let rdId = randomId()
                    childrenNotHasPartnerCardId.push(rdId)
                    allChildrenCardId.push(rdId)
                    $group.find('#'+id2).append($childCard.attr('id', rdId))
                })

                childrenHasPartnerSameSpouse.forEach(({child}) => {
                    let $childCard = createFamilyGroup(child)
                    let rdId = randomId()
                    childrenHasPartnerSameSpouseCardId.push(rdId)
                    allChildrenCardId.push(rdId)
                    $group.find('#'+id2).append($childCard.attr('id', rdId))
                })

                for(let partnerId of idsOfPartnersDiffFromSpouse) {
                    groupChildrenHasPartnerDiffFromSpouse[partnerId].children.forEach(child => {
                        let $childCard = createFamilyGroup(child)
                        let rdId = randomId()
                        mapPartnerIdToChildrenCardId[partnerId].push(rdId)
                        allChildrenCardId.push(rdId)
                        $group.find('#'+id2).append($childCard.attr('id', rdId))
                    })
                }

                let drawPartner = (config.targetPeople.showWifes && person.gender == 'Nam') || config.targetPeople.hasRelationShipMainBranch
                if (drawPartner) {
                    if (person.spouse) {
                        $group.find('#'+id1).append(`<div style="width: ${props.horizontalDistance}px;"></div>`)
                        let $spouseCard = createPersonCard(person.spouse)
                        $group.find('#'+id1).append($spouseCard.attr('id', id4))
                    }

                    idsOfPartnersDiffFromSpouse.forEach(id => {
                        $group.find('#'+id1).append(`<div style="width: ${props.horizontalDistance}px;"></div>`)
                        let $partnerCard = createPersonCard(groupChildrenHasPartnerDiffFromSpouse[id].partner)
                        let rdId = randomId()
                        mapPartnerIdToCardId[id] = rdId
                        $group.find('#'+id1).append($partnerCard.attr('id', rdId))
                    })
                }

                if ((drawPartner && person.spouse) || allChildren.length != 0) {
                    function drawLine(x1, y1, x2, y2, padding1 = false, padding2 = false) {
                        let lineWidth = 8
                        let lineHeight = Math.sqrt((x1 - x2)**2 + (y1 - y2)**2)
                        if (padding1) {
                            // Move point 1 along the direction vector from point 2 to point 1 by (lineWidth/2) px
                            lineHeight += lineWidth/2
                            let [a, b] = [x1 - x2, y1 - y2]
                            x1 += (lineWidth/2)*a/(a**2 + b**2)
                            y1 += (lineWidth/2)*b/(a**2 + b**2)
                        }
                        if (padding2) {
                            // Move point 2 along the direction vector from point 1 to point 2 by (lineWidth/2) px
                            lineHeight += lineWidth/2
                            let [a, b] = [x2 - x1, y2 - y1]
                            x2 += (lineWidth/2)*a/(a**2 + b**2)
                            y2 += (lineWidth/2)*b/(a**2 + b**2)
                        }
            
                        let line = $('<div></div>').css({
                            height: lineWidth+'px',
                            width: lineHeight+'px',
                            position: 'absolute',
                            left: ((x1+x2)/2 - lineHeight/2)+'px',
                            top: ((y1+y2)/2 - lineWidth/2)+'px',
                            transform: `rotate(${Math.atan((y2-y1)/(x2-x1))*180/Math.PI}deg)`,
                            'background-color': 'green',
                        })

                        $group.append(line)
                    }

                    drawLineCallbacks.push(function draw() {
                        let $person = $group.find('#'+id3)
                        let pPos = $person.position()
                        let pHeight = $person.outerHeight()
                        let pWidth = $person.outerWidth()

                        let horiLineY = null

                        function getChildCardStyle(childCardId) {
                            let $childCard = $group.find(`#${childCardId}`)
                            let temp = $childCard.position()
                            let top1 = temp.top, left1 = temp.left

                            let $childCardFirstPar = $group.find(`#${childCardId} > .parent > div:first-child`)
                            temp = $childCardFirstPar.position()
                            let top2 = temp.top, left2 = temp.left
                            
                            return {
                                top: top1 + top2,
                                left: left1 + left2,
                                height: $childCardFirstPar.outerHeight(),
                                width: $childCardFirstPar.outerWidth()
                            }
                        }

                        if (allChildrenCardId.length != 0) {
                            horiLineY = ((pPos.top + pHeight) + getChildCardStyle(allChildrenCardId[0]).top)/2
                        }

                        function drawConnectLinesBetweenChildrenWithAbove(cardIds, x, y, reduceY = 0) {
                            if (cardIds.length == 0) return

                            let mapCardIdToInfo = {}
                            cardIds.forEach(cardId => {
                                mapCardIdToInfo[cardId] = getChildCardStyle(cardId)
                            })
                            let firstCardId = cardIds[0]

                            if (cardIds.length == 1) {
                                let x2 = mapCardIdToInfo[firstCardId].left + mapCardIdToInfo[firstCardId].width/2
                                let y2 = mapCardIdToInfo[firstCardId].top
                                
                                if (x == x2) {
                                    drawLine(x, y, x2, y2)
                                }
                                else {
                                    drawLine(x, y, x, horiLineY - reduceY, false, true)
                                    drawLine(x2, horiLineY - reduceY, x, horiLineY - reduceY, true, true)
                                    drawLine(x2, horiLineY - reduceY, x2, y2, true, false)
                                }
                            }
                            else {
                                let horiLineX1 = mapCardIdToInfo[firstCardId].left + mapCardIdToInfo[firstCardId].width/2
                                let lastCardId = cardIds[cardIds.length - 1]
                                let horiLineX2 = mapCardIdToInfo[lastCardId].left + mapCardIdToInfo[lastCardId].width/2

                                if (horiLineX1 <= x && x <= horiLineX2) {
                                    drawLine(x, y, x, horiLineY, false, true)
                                } else {
                                    drawLine(x, y, x, horiLineY - reduceY, false, true)
                                    drawLine(x, horiLineY - reduceY, (horiLineX1 + horiLineX2)/2, horiLineY - reduceY, true, true)
                                    drawLine((horiLineX1 + horiLineX2)/2, horiLineY - reduceY, (horiLineX1 + horiLineX2)/2, horiLineY, true, false)
                                }
                                drawLine(horiLineX1, horiLineY, horiLineX2, horiLineY, true, true)

                                cardIds.forEach(cardId => {
                                    let vertLineX = mapCardIdToInfo[cardId].left + mapCardIdToInfo[cardId].width/2
                                    let vertLineY1 = horiLineY
                                    let vertLineY2 = mapCardIdToInfo[cardId].top

                                    drawLine(vertLineX, vertLineY1, vertLineX, vertLineY2, true, false)
                                })
                            }
                        }

                        // Doesnot draw partner
                        if (!drawPartner) {
                            drawConnectLinesBetweenChildrenWithAbove(allChildrenCardId, pPos.left + pWidth/2, pPos.top + pHeight)
                            return
                        }

                        // Draw partner is condition to below

                        // Draw children has no partner
                        if (childrenNotHasPartnerCardId.length != 0) {
                            drawConnectLinesBetweenChildrenWithAbove(childrenNotHasPartnerCardId, pPos.left + pWidth/2, pPos.top + pHeight)
                        }
                        
                        // Draw children has same partner
                        if (person.spouse) {
                            let $spouseCard = $group.find('#'+id4)
                            let x1 = pPos.left + pWidth
                            let x2 = $spouseCard.position().left
                            let y = pPos.top + pHeight/2
                            drawLine(x1, y, x2, y)

                            let delta
                            if (childrenNotHasPartnerCardId.length == 0) {
                                delta = 0
                            } else {
                                delta = (idsOfPartnersDiffFromSpouse.length == 0) ? config.props.verticalDistance/4 : config.props.verticalDistance/6
                            }
                            drawConnectLinesBetweenChildrenWithAbove(childrenHasPartnerSameSpouseCardId, (x1 + x2)/2, y, delta)
                        }

                        // Draw children has partner difference from spouse
                        let numPartnersDiffFromSpouse = idsOfPartnersDiffFromSpouse.length
                        idsOfPartnersDiffFromSpouse.forEach((partnerId, index) => {
                            let $partnerCard = $group.find('#'+mapPartnerIdToCardId[partnerId])
                            let partnerPos = $partnerCard.position()
                            let partnerWidth = $partnerCard.outerWidth()

                            let x1 = pPos.left + pWidth/2
                            let x2 = partnerPos.left + partnerWidth/2
                            let y = pPos.top - ((index + 1)/(numPartnersDiffFromSpouse + 1))*(horiLineY - pPos.top - pHeight)
                            drawLine(x1, y, x2, y, true, true)

                            drawLine(x1, y, x1, pPos.top, true, false)
                            drawLine(x2, y, x2, pPos.top, true, false)

                            let delta
                            if (childrenNotHasPartnerCardId.length == 0) {
                                delta = (childrenHasPartnerSameSpouseCardId.length == 0) ? 0 : config.props.verticalDistance/4
                            } else {
                                delta = (childrenHasPartnerSameSpouseCardId.length == 0) ? config.props.verticalDistance/4 : config.props.verticalDistance/3
                            }
                            drawConnectLinesBetweenChildrenWithAbove(mapPartnerIdToChildrenCardId[partnerId], x2 - partnerWidth/2 - config.props.horizontalDistance/2, y, delta)
                        })
                    })
                }

                return $group
            }

            // Scaling tab and move
            let [moveToCard, isClickEvent] = (() => {
                let scale = 1,
                panning = false,
                pointX = 0,
                pointY = 0,
                start = { x: 0, y: 0 },
                zoom = $tab[0]
                let maxScale = 2
                let minScale = 0.01
            
                function setTransform() {
                    $tab.css('transform', `translate(${pointX}px, ${pointY}px) scale(${scale})`)
                }

                let xBeforeMouseDown, yBeforeMouseDown
                let xAfterMouseUp, yAfterMouseUp
            
                zoom.onmousedown = function (e) {
                    e.preventDefault()
                    xBeforeMouseDown = pointX
                    yBeforeMouseDown = pointY
                    start = {
                        x: e.clientX - pointX,
                        y: e.clientY - pointY
                    }
                    panning = true
                }
            
                zoom.onmouseup = function (e) {
                    panning = false
                    xAfterMouseUp = pointX
                    yAfterMouseUp = pointY
                }
            
                zoom.onmousemove = function (e) {
                    e.preventDefault()
                    if (!panning) {
                        return
                    }
                    pointX = (e.clientX - start.x)
                    pointY = (e.clientY - start.y)
                    setTransform()
                }

                zoom.onwheel = function (e) {
                    e.preventDefault()
                    let  xs = (e.clientX - pointX) / scale
                    let ys = (e.clientY - pointY) / scale
                    let delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY)
                    scale *= (delta > 0) ? 1.1 : (1/1.1)
                    scale = Math.min(Math.max(scale, minScale), maxScale)
                    pointX = e.clientX - xs * scale
                    pointY = e.clientY - ys * scale
            
                    setTransform()
                }

                let moveToCard = ($card, duration = 0, end) => {
                    if (!$card) return

                    let height = $card.outerHeight()
                    let width = $card.outerWidth()
                    let documentHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
                    let documentWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
                    let mainPaddingLeft = parseInt($('#main').css('padding-left').replace('px', ''))
                    if (isNaN(mainPaddingLeft)) mainPaddingLeft = 256
                    
                    let targetOffset = {
                        top: $('#header').outerHeight() + (documentHeight - $('#header').outerHeight())/2 - height/2,
                        left: mainPaddingLeft + (documentWidth - mainPaddingLeft)/2 - width/2
                    }

                    let realOffset = $card.offset()

                    if (duration <= 0) {
                        pointX = targetOffset.left - realOffset.left
                        pointY = targetOffset.top - realOffset.top
                        setTransform()
                        if (end) end()
                        return
                    }

                    $tab.animate({
                        left: `+=${targetOffset.left - realOffset.left - pointX}px`,
                        top: `+=${targetOffset.top - realOffset.top - pointY}px`
                    }, duration, () => {
                        pointX = targetOffset.left - realOffset.left
                        pointY = targetOffset.top - realOffset.top
                        setTransform()
                        $tab.css({
                            left: 0,
                            top: 0
                        })
                    })
                }

                let isClickEvent = () => {
                    let delta = 1
                    return Math.abs(xAfterMouseUp - xBeforeMouseDown) < delta && Math.abs(yAfterMouseUp - yBeforeMouseDown) < delta
                }

                return [moveToCard, isClickEvent]
            })()

            if (backupDataAncestor) {
                drawTree({
                    ancestor: backupDataAncestor,
                    targetPersonId: config.targetPersonId
                })
            } else {
                api.drawFamilyTree({targetPersonId: config.targetPersonId, level: 1}).then(drawTree)
            }

            function drawTree({ancestor, targetPersonId}) {
                config.targetPersonId = targetPersonId
                backupDataAncestor = null
                let $tree = createFamilyGroup(ancestor)
                $tree.css({
                    position: 'fixed',
                    top: '200%'
                })
                $tab.append($tree)
                setTimeout(() => drawLineCallbacks.forEach(f => f()), 100)
                setTimeout(() => {
                    $tree.css({
                        position: 'unset',
                        top: 'unset'
                    })
                    moveToCard($focusPersonCard || $targetPersonCard)
                }, 200)

                function createOptionHtml(type) {
                    return `<div style="height: 3rem; width: 3rem; padding: 0.6rem; margin-left: 0.5rem; border-radius: 0.5rem; background-color: white; border: 1px solid rgba(0, 0, 21, 0.175); cursor: pointer;">
                        <svg class="nav-icon" style="width: 100%; height: 100%;">
                            <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-${type}"></use>
                        </svg>
                    </div>`
                }

                $tab.parent().append(
                    $('<div style="position: fixed; bottom: 1rem; right: 1rem; display: flex;"></div>').append(
                        $(createOptionHtml('zoom-in')).click(() => {
                            
                        }).hide(),
                        $(createOptionHtml('location-pin')).click(() => {
                            
                        }).hide(),
                        $(createOptionHtml('settings')).click(() => {
                            let html = `
                                <label class="form-label" style="margin-top: 1.5rem;">Thông tin hiển thị trên biểu đồ</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="show-name" ${config.show.name ? 'checked' : ''} disabled>
                                    <label class="form-check-label" for="show-name">
                                        Tên gọi
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="show-image" ${config.show.image ? 'checked' : ''}>
                                    <label class="form-check-label" for="show-image">
                                        Ảnh
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="show-gender" ${config.show.gender ? 'checked' : ''}>
                                    <label class="form-check-label" for="show-gender">
                                        Giới tính
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="show-birthday" ${config.show.birthday ? 'checked' : ''}>
                                    <label class="form-check-label" for="show-birthday">
                                        Ngày sinh
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="show-deathday" ${config.show.deathday ? 'checked' : ''}>
                                    <label class="form-check-label" for="show-deathday">
                                        Ngày mất
                                    </label>
                                </div>

                                <label class="form-label" style="margin-top: 1.5rem;">Bố cục biểu đồ</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="layout" id="layout-default" ${config.layout.default ? 'checked' : ''}>
                                    <label class="form-check-label" for="layout-default">
                                        Tối ưu chiều cao
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="layout" id="layout-minWidth" ${config.layout.minWidth ? 'checked' : ''}>
                                    <label class="form-check-label" for="layout-minWidth">
                                        Tối ưu chiều rộng
                                    </label>
                                </div>

                                <label class="form-label" style="margin-top: 1.5rem;">Kiểu biểu đồ gia phả</label>
                                <select class="form-select" name="targetPeople">
                                    <option value="default" ${config.targetPeople.default ? 'selected' : ''}>Mức 1: Không vẽ vợ của các nam trong dòng họ</option>
                                    <option value="showWifes" ${config.targetPeople.showWifes ? 'selected' : ''}>Mức 2: Vẽ vợ của các nam trong dòng họ</option>
                                    <option value="hasRelationShipMainBranch" ${config.targetPeople.hasRelationShipMainBranch ? 'selected' : ''}>Mức 3: Vẽ bất cứ ai có quan hệ (vẽ cả chồng và con cái của các nữ trong dòng họ)</option>
                                </select>

                                <label class="form-label" style="margin-top: 1.5rem;">Khoảng cách theo chiều ngang</label>
                                <select class="form-select" name="horizontalDistance"></select>

                                <label class="form-label" style="margin-top: 1.5rem;">Khoảng cách theo chiều dọc</label>
                                <select class="form-select" name="verticalDistance"></select>
                            `
                            let [$getPersonInput, _, getPersonId, __] = FieldInput$ElementFactory({
                                type: 'PERSON',
                                name: 'Chủ thể biểu đồ gia phả',
                                isMultiValue: false,
                                value: targetPersonId,
                                code: 'Some values to make sure can not be changed'
                            })
                            bigPopUp(html, {
                                script: $popUp => {
                                    $popUp.find('.content').prepend($getPersonInput)

                                    let $selectHorizontalDistance = $popUp.find('.content select[name="horizontalDistance"]')
                                    for (let i = 1; i <= 8; i++) {
                                        $selectHorizontalDistance.append(`<option value="${i*20}" ${config.props.horizontalDistance == (i*20) ? 'selected' : ''}>${i*20} px</option>`)
                                    }

                                    let $selectVerticalDistance = $popUp.find('.content select[name="verticalDistance"]')
                                    for (let i = 1; i <= 8; i++) {
                                        $selectVerticalDistance.append(`<option value="${i*20}" ${config.props.verticalDistance == (i*20) ? 'selected' : ''}>${i*20} px</option>`)
                                    }
                                },
                                hideCloseButton: true,
                                buttons: [
                                    {
                                        html: 'Thoát',
                                        click: $popUp => $popUp.remove()
                                    },
                                    {
                                        html: 'Lưu thay đổi',
                                        type: 'success',
                                        click: $popUp => {
                                            config.show.image = $popUp.find('input#show-image')[0].checked
                                            config.show.gender = $popUp.find('input#show-gender')[0].checked
                                            config.show.birthday = $popUp.find('input#show-birthday')[0].checked
                                            config.show.deathday = $popUp.find('input#show-deathday')[0].checked

                                            config.layout.default = $popUp.find('input#layout-default')[0].checked
                                            config.layout.minWidth = $popUp.find('input#layout-minWidth')[0].checked
                                            if (config.layout.default && config.layout.minWidth) config.layout.minWidth = false

                                            let targetPeople = $popUp.find('select[name="targetPeople"]').val()
                                            let targetPeopleValid = false
                                            for (let key in config.targetPeople) {
                                                if (key == targetPeople) {
                                                    targetPeopleValid = true
                                                    config.targetPeople[key] = true
                                                } else {
                                                    config.targetPeople[key] = false
                                                }
                                            }
                                            if (!targetPeopleValid) config.targetPeople.default = true

                                            let horizontalDistance = Number($popUp.find('select[name="horizontalDistance"]').val())
                                            if (isNaN(horizontalDistance) || Math.round(horizontalDistance) != horizontalDistance
                                                || horizontalDistance < 20 || horizontalDistance > 160
                                                || horizontalDistance%20 != 0) {
                                                    horizontalDistance = 80
                                            }
                                            config.props.horizontalDistance = horizontalDistance

                                            let verticalDistance = Number($popUp.find('select[name="verticalDistance"]').val())
                                            if (isNaN(verticalDistance) || Math.round(verticalDistance) != verticalDistance
                                                || verticalDistance < 20 || verticalDistance > 160
                                                || verticalDistance%20 != 0) {
                                                    verticalDistance = 80
                                            }
                                            config.props.verticalDistance = verticalDistance

                                            let targetedPersonIdFromInput = getPersonId().value
                                            if (!targetedPersonIdFromInput || targetedPersonIdFromInput == '') {
                                                targetedPersonIdFromInput = targetPersonId
                                            }

                                            $('#tab-family-tree').html('')
                                            if (targetedPersonIdFromInput != targetPersonId) {
                                                config.targetPersonId = targetedPersonIdFromInput
                                                config.focusPersonId = null
                                                createTree()
                                            } else {
                                                backupDataAncestor = ancestor
                                                config.focusPersonId = null
                                                createTree()
                                            }

                                            $popUp.remove()
                                        }
                                    }
                                ]
                            })
                        })
                    )
                )
            }
        }

        createTree()
    }

    $('#tab-people-manager')[0].load = tabPeopleManager
    $('#tab-family-tree')[0].load = tabFamilyTree
}
