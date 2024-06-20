
const mulValDel = '###'
const imgMaxSizes = 100*1000 
const pUViewPBsIdx = 100000
const defAvtUrl = './resources/default-avatar.jpg'

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
        hideClBtn: true,
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

function puAddField(personId, addScCb) {
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

        <div class="col-6" style="display: none;">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="f-mval" name="isMultiValue">
                <label class="form-check-label" for="f-mval">Trường thông tin là đa giá trị</label>
            </div>
        </div>

        <div class="col-6">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="fForAllPP" name="isForAllPeople">
                <label class="form-check-label" for="fForAllPP">Thêm cho tất cả người thân của tôi</label>
            </div>
        </div>
    </form>`

    let $nameInput, $nameInpFb
    bigPopUp(html, {
        zIndex: 120000,
        script: ($popUp) => {
            $nameInput = $popUp.find('input#field-name')
            $nameInpFb = $nameInput.parent().find('.invalid-feedback')

            $nameInput.keydown(() => {
                $nameInpFb.hide()
                $nameInput.removeClass('is-invalid')
            })
        },
        hideClBtn: true,
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
                        $nameInpFb.show().html('Không được bỏ trống phần tên!')
                        return
                    }

                    let data = {personId}
                    let inputs = [...$popUp.find('input'), ...$popUp.find('select')]
                    inputs.forEach(input => {
                        data[input.name] = (input.type == 'checkbox') ? (input.checked) : input.value
                    })

                    api.addField({data}).then(({newFieldDef}) => {
                        addScCb(newFieldDef)
                        $popUp.remove()
                    })
                }
            }
        ]
    })
}

function puEditField({id, name, description, isForAllPeople}, udSuccCb) {
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

    let $nameInput, $nameInpFb
    bigPopUp(html, {
        zIndex: 120000,
        script: ($popUp) => {
            $nameInput = $popUp.find('input#field-name')
            $nameInpFb = $nameInput.parent().find('.invalid-feedback')

            $nameInput.keydown(() => {
                $nameInpFb.hide()
                $nameInput.removeClass('is-invalid')
            })
        },
        hideClBtn: true,
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
                            udSuccCb({deleted: true})
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
                        $nameInpFb.show().html('Không được bỏ trống phần tên!')
                        return
                    }

                    let data = {id}
                    let inputs = [...$popUp.find('input'), ...$popUp.find('select')]
                    inputs.forEach(input => {
                        data[input.name] = (input.type == 'checkbox') ? (input.checked) : input.value
                    })

                    api.updateField({data}).then(() => {
                        udSuccCb(data)
                        $popUp.remove()
                    })
                }
            }
        ]
    })
}

function puAddP(addScCb, { gender, target, asRole, targetGender } = {}) {
    let fFacReturnVal = []
    bigPopUp('', {
        script: $popUp => {
            let $from = $('<form class="row g-3" style="--cui-gutter-y: 3rem; --cui-gutter-x: 4rem;"></form>')
            fFacReturnVal = [
                gen$fInput({type: 'STRING', name: 'Tên gọi', placeholder: 'Ví dụ: Ông Nguyễn Văn A', code: 'callname'}),
                gen$fInput((() => {
                    let result = {type: 'GENDER', name: 'Giới tính', code: 'gender'}
                    if (gender) {
                        Object.assign(result, {
                            value: gender, disabled: true
                        })
                    }
                    return result
                })()),
                gen$fInput((() => {
                    let result = {type: 'PERSON', name: 'Bố', code: 'father'}
                    if (asRole == 'child' && targetGender == 'Nam') {
                        Object.assign(result, {
                            value: target,
                            disabled: true
                        })
                    }
                    return result
                })()),
                gen$fInput((() => {
                    let result = {type: 'PERSON', name: 'Mẹ', code: 'mother'}
                    if (asRole == 'child' && targetGender == 'Nữ') {
                        Object.assign(result, {
                            value: target,
                            disabled: true
                        })
                    }
                    return result
                })()),
                gen$fInput((() => {
                    let result = {type: 'PERSON', name: 'Vợ / Chồng', code: 'spouse'}
                    if (asRole == 'spouse') {
                        Object.assign(result, {
                            value: target,
                            disabled: true
                        })
                    }
                    return result
                })()),
                gen$fInput({type: 'IMAGE', name: 'Ảnh', code: 'avatar'}),
                gen$fInput({type: 'DATE', name: 'Ngày sinh', code: 'birthday'}),
                gen$fInput({type: 'LUNAR_DATE', name: 'Ngày mất', code: 'deathday'})
            ]
            $from.append(fFacReturnVal.map(i => i[0]))

            $popUp.find('.content').append($from)
        },
        hideClBtn: true,
        buttons: [
            {
                html: 'Thoát',
                click: $popUp => {$popUp.remove(); $(document.body).removeClass('stScroll')}
            },
            {
                html: 'Thêm người thân',
                type: 'success',
                click: $popUp => {
                    if (fFacReturnVal.every(i => i[1]())) { 
                        let data = fFacReturnVal.map(i => i[2]())
                        api.addPerson({data, target, asRole}).then(() => {
                            $popUp.remove()
                            $(document.body).removeClass('stScroll')
                            addScCb()
                        })
                    }
                }
            }
        ]
    })
}

function puPickP(callback, {isMultiValue, maleOnly, femaleOnly, exceptIds, pickedIds}) {
    isMultiValue = isMultiValue || false
    maleOnly = maleOnly || false
    femaleOnly = femaleOnly || false
    exceptIds = exceptIds || []
    exceptIds = new Set(exceptIds)
    pickedIds = pickedIds || []
    pickedIds = new Set(pickedIds)

    let getPickedPP = null

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
            api.getPPBsInf().then(people => {
                if (maleOnly) people = people.filter(({gender}) => gender == 'Nam')
                else if (femaleOnly) people = people.filter(({gender}) => gender != 'Nam')
                people = people.filter(({id}) => !exceptIds.has(id))
                
                let list$persons = []
                let rdName = randomId()

                people.forEach(person => {
                    let {id, callname, avatar, searchString} = person
                    searchString = (searchString && searchString != '') ? searchString : callname
                    let $person = $(`<tr class="align-middle">
                        <td style="width: 3em; position: relative;"><input class="form-check-input" type="${isMultiValue ? 'checkbox' : 'radio'}" style="position: absolute;
                            top: 50%; left: 50%; transform: translate(-50%, -50%); margin: 0;" ${isMultiValue ? '' : `name="${rdName}"`} ${pickedIds.has(id) ? 'checked' : ''}></td>
                        <td style="width: 3em;">
                            <div class="avatar avatar-md">
                                <img class="avatar-img my-img card-border" src="${avatar || defAvtUrl}">
                            </div>
                        </td>
                        <td><div>${callname}</div></td>
                    </tr>`)

                    $content.find('tbody').append($person)
                    
                    list$persons.push($person)

                    searchString = searchString.toLowerCase()
                    while (searchString.includes('  ')) searchString = searchString.replaceAll('  ', ' ').trim()
                    let sstr2 = new Set(searchString.split(' '))
                    let sStrNorm2 = new Set(searchString.split(' ').map(w => rmAccents(w)))
                    let sStrNorm = [...sStrNorm2].join(' ')

                    $person.score = (vs, nvs) => {
                        let score = 0
                        if ($person.find('input')[0].checked) {
                            score = 1
                        }

                        for (let v of nvs) {
                            if (sStrNorm.includes(v)) score += 5
                            if (sStrNorm2.has(v)) score += 10
                        }
                        for (let v of vs) {
                            if (searchString.includes(v)) score += 10
                            if (sstr2.has(v)) score += 20
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
                    let nvs = [...new Set(vs.map(v => rmAccents(v)))]
                    
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

                getPickedPP = () => list$persons.filter($person => $person.choosed()).map($person => $person.getPerson())
            })
        },
        hideClBtn: true,
        buttons: [{
            html: 'Thoát',
            click: $popUp => {
                $popUp.remove()
            }
        }, {
            html: 'Xác nhận',
            type: 'success',
            click: $popUp => {
                $popUp.remove()
                callback(getPickedPP ? getPickedPP() : [])
            }
        }]
    })
}

function gen$fInput({id, code, type, placeholder, name, description, isMultiValue, value, isForAllPeople, personId, disabled}, udFieldDefCb) {
    value = value || ''
    let $element, validate, getValue, valueChanged
    let labelId = randomId()

    function dateValid(s, isLunarDate = false, tSpRange = false) {
        
        if (!DateLib.isSuiForm(s)) {
            return [false, 'Sai định dạng NGÀY/THÁNG/NĂM!']
        }

        if (tSpRange && (!DateLib.isDInSpRange(s))) {
            return [false, 'Đối với kiểu dữ liệu này, chỉ hỗ trợ ngày tháng từ năm 1801 đến năm 2198!']
        }

        if (!(isLunarDate ? DateLib.isValidLDate(s) : DateLib.isValidDate(s))) {
            return [false, 'Không tồn tại ngày tháng này!']
        }

        return [true]
    }

    if (isMultiValue) {
        let btAddonId = randomId()
        let counter = 0
        let idxToVal = {}
        let addValue = val => {
            idxToVal[++counter] = val
            return counter
        }
        let removeValue = index => delete idxToVal[index]
        let sAddedVl 

        switch (type) {
            case 'STRING':
                $element = $(`<div class="col-12">
                    <label for="${labelId}" class="form-label">${name}</label>
                    <div class="input-group mb-3" style="margin-bottom: 0 !important;">
                        <input type="text" class="form-control" id="${labelId}" ${placeholder ? `placeholder="${placeholder}"` : ''}>
                        <button class="btn btn-outline-secondary" type="button" id="${btAddonId}">Thêm giá trị</button>
                    </div>
                    
                    <div class="card value-list" style="width: 100%;">
                        <div class="card-header" style="color: #9da5b1; border: none;">Chưa có giá trị</div>
                        <ul class="list-group list-group-flush"></ul>
                    </div>
                </div>`)

                sAddedVl = function (val) {
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

                $element.find(`#${btAddonId}`).click(() => {
                    let $input = $element.find(`#${labelId}`)
                    let value = $input.val()
                    if (value == '') {
                        return
                    }
                    $input.val('')
                    sAddedVl(value)
                })
                break
            case 'DATE':
                $element = $(`<div class="col-md-5">
                    <label for="${labelId}" class="form-label">${name}</label>
                    <div class="input-group mb-3" style="margin-bottom: 0 !important;">
                        <input type="text" class="form-control" id="${labelId}" ${placeholder ? `placeholder="${placeholder}"` : 'placeholder="Ngày dương lịch định dạng NGÀY/THÁNG/NĂM"'}>
                        <button class="btn btn-outline-secondary" type="button" id="${btAddonId}" style="border-radius: var(--cui-btn-border-radius);
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

                sAddedVl = function (val) {
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

                $element.find(`#${btAddonId}`).click(() => {
                    let $input = $element.find(`#${labelId}`)
                    let value = $input.val()
                    if (value == '') {
                        return
                    }

                    let [isValid, message] = dateValid(value)
                    if (isValid) {
                        $input.val('')
                        sAddedVl(value)
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
                        <button class="btn btn-outline-secondary" type="button" id="${btAddonId}" style="border-radius: var(--cui-btn-border-radius);
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

                sAddedVl = function (val) {
                    let index = addValue(val)
                    $element.find('.value-list .card-header').remove()
    
                    let $value = $(`<li class="list-group-item" style="position: relative;">
                        ${val} ~ ${DateLib.lDateToDate(val)} dương lịch
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

                $element.find(`#${btAddonId}`).click(() => {
                    let value = $input2.val()
                    if (value == '') {
                        return
                    }

                    let isLunarDate = $element.find(`#${id2}`)[0].checked

                    let [isValid, message] = dateValid(value, isLunarDate, true)
                    if (isValid) {
                        $input2.val('')
                        sAddedVl(isLunarDate ? value : DateLib.dateToLDate(value))
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
                
                let choosedPIds = []

                sAddedVl = function (val) {
                    let cFromPuPickPerson = Array.isArray(val)

                    function _add(person) {
                        

                        $element.find('.value-list .card-header').remove()

                        let id = cFromPuPickPerson ? person.id : person
                        let index = addValue(id)
                        choosedPIds.push(id)

                        let $person = $(`<li class="list-group-item" style="position: relative; height: 4rem; display: flex; align-items: center;">
                            <div class="name">${person.callname || 'Đang tải...'}</div>
                        </li>`)

                        $element.find('.value-list ul').append($person)

                        function innerAddRmnEvts(avatar) {
                            $person.prepend(`<img src="${avatar || defAvtUrl}" style="height: 100%; margin-right: 0.8rem;" class="my-img card-border">`)
                            $person.append(
                                $(`<svg class="icon" style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); cursor: pointer;">
                                    <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-trash"></use>
                                </svg>`).click(() => {
                                    removeValue(index)
                                    $person.remove()
                                    choosedPIds = choosedPIds.filter(_id => _id != id)
                                    if ($element.find('ul > li').length == 0) {
                                        $element.find('.value-list').append('<div class="card-header" style="color: #9da5b1; border: none;">Chưa có ai</div>')
                                    }
                                })
                            )
                        }
    
                        if (cFromPuPickPerson) {
                            innerAddRmnEvts(person.avatar)
                        } else {
                            api.getPBsInf({id: person}).then(({avatar, callname}) => {
                                $person.find('.name').html(callname)
                                innerAddRmnEvts(avatar)
                            })
                        }
                    }

                    if (cFromPuPickPerson) {
                        val.forEach(person => _add(person))
                    } else {
                        _add(val)
                    }
                }
                $element.find('button').click(() => {
                    puPickP(sAddedVl, {
                        isMultiValue,
                        maleOnly: code == 'father' ? true : false,
                        femaleOnly: code == 'mother' ? true : false,
                        exceptIds: choosedPIds
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

                sAddedVl = function (val) {
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
                            resizeImage(e.target.result, imgMaxSizes).then(sAddedVl)
                        }
                        reader.readAsDataURL(input.files[0])
                        input.value = ''
                    }
                })

                break
        }

        if (value != '') {
            value.split(mulValDel).forEach(v => sAddedVl(v))
        }

        let cntInitEnd = counter

        validate = () => true
        getValue = () => range(counter + 1).filter(i => idxToVal[i]).map(i => idxToVal[i]).join(mulValDel)
        valueChanged = () => range(cntInitEnd + 1, counter + 1).some(i => idxToVal[i])
    }
    else {
        switch (type) {
            case 'STRING':
                $element = $(`<div class="col-xl-4 col-lg-6 col-md-8">
                    <label for="${labelId}" class="form-label">${name}${code == 'callname' ? '<span style="color: red;"> *</span>' : ''}</label>
                    <textarea class="form-control" id="${labelId}" rows="${code == 'callname' ? 1 : 3}" ${placeholder ? `placeholder="${placeholder}"` : ''}>${value ? value : ''}</textarea>
                    <div class="invalid-feedback"></div>
                </div>`)
                $element.find('textarea').keydown(() => {
                    $element.find('.invalid-feedback').hide()
                    $element.find('textarea').removeClass('is-invalid')
                })
                validate = () => {
                    if (code == 'callname' && $element.find('textarea').val() == '') {
                        $element.find('.invalid-feedback').show().html('Không được để trống thông tin này!')
                        $element.find('textarea').addClass('is-invalid')
                        return false
                    }
                    return true
                }
                getValue = () => $element.find('textarea').val()
                valueChanged = () => value != getValue()
                break
            case 'DATE':
                $element = $(`<div class="col-xl-4 col-lg-6 col-md-8">
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

                    let [isValid, message] = dateValid(val)

                    if (isValid) {
                        return true
                    }

                    $element.find('.invalid-feedback').show().html(message)
                    $element.find('input').addClass('is-invalid')

                    return false
                }
                getValue = () => {
                    let val = $element.find('input').val()
                    return val == '' ? '' : DateLib.shtDStr(val)
                }
                valueChanged = () => value != getValue()
                break
            case 'LUNAR_DATE':
                let id1 = randomId(), id2 = randomId(), rdName = randomId()
                $element = $(`<div class="col-xl-4 col-lg-6 col-md-8">
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

                    let [isValid, message] = dateValid(val, isLunarDate, true)

                    if (isValid) return true

                    $feedBack.show().html(message)
                    $input.addClass('is-invalid')
                    return false
                }
                getValue = () => {
                    let val = $input.val()
                    if (val == '') return ''
                    let isLunarDate = $element.find(`#${id2}`)[0].checked

                    return DateLib.shtDStr(isLunarDate ? val : DateLib.dateToLDate(val))
                }
                valueChanged = () => value != getValue()
                break
            case 'GENDER':
                let alertText = ''
                if (!value) {
                    
                    alertText = 'Đây là thuộc tính quan trọng, ảnh hưởng đến hầu hết các chức năng của trang web!'
                } else {
                    
                    alertText = 'Nếu giới tính bị thay đổi, mối quan hệ (bố / mẹ) của con cái người này sẽ bị xóa!'
                }
                let id3 = randomId(), id4 = randomId(), rdName2 = randomId()
                $element = $(`<div class="col-lg-12 col-md-8">
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
                $element = $(`<div class="col-xl-4 col-lg-6 col-md-8">
                    <label for="${labelId}" class="form-label">${name}</label>
                    <div class="input-group" style="position: relative;">
                        <input type="text" class="form-control" value="Chọn..." readonly style="cursor: pointer;">
                        <button class="btn btn-outline-secondary" type="button" style="border-radius: var(--cui-btn-border-radius); border-top-left-radius: 0; border-bottom-left-radius: 0;" ${disabled ? 'disabled' : ''}>Chọn</button>
                        <div class="show-choosed-person" style="position: absolute; top: 0; bottom: 0; display: flex; align-items: center; z-index: 5;">
                            <img src="" style="height: calc(100% - 1.2rem); margin: 0 0.8rem;" class="my-img card-border">
                            <div class="name"></div>
                        </div>
                    </div>
                </div>`)
                $element.find('div.show-choosed-person').hide()
                $element.find('label').click(() => {
                    if (!choosedPIds) $element.find('button').click()
                })
                let choosedPIds = ''
                function displayChoosedP([person]) {
                    if (!person) return
                    choosedPIds = person.id
                    $element.find('button').html('Xóa')
                    $element.find('div.show-choosed-person img').attr('src', person.avatar || defAvtUrl)
                    $element.find('div.show-choosed-person .name').html(person.callname)
                    $element.find('div.show-choosed-person').show()
                    $element.find('input').addClass('show-choosed-person').val('')
                }
                $element.find('button').click(() => {
                    if (choosedPIds != '') {
                        $element.find('button').html('Chọn')
                        choosedPIds = ''
                        $element.find('input').val('Chọn...')
                        $element.find('div.show-choosed-person').hide()
                        $element.find('input').removeClass('show-choosed-person')
                    } else {
                        puPickP(displayChoosedP, {
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
                    api.getPBsInf({id: value}).then(result => {
                        $element.find('input').val('Chọn...')
                        $element.find('button').show()
                        displayChoosedP([result])
                    })
                }
                validate = () => true
                getValue = () => choosedPIds
                valueChanged = () => value != getValue()
                break
            case 'IMAGE':
                $element = $(`<div class="col-xl-4 col-lg-6 col-md-8">
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
                            resizeImage(imageUrl, imgMaxSizes).then(chooseImage)
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

    let vlChanged2 = () => {
        if (fieldDeleted) return false
        return valueChanged()
    }

    if (!code) { 
        let $label = $element.find(`label[for="${labelId}"]`)

        function assOps() {
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
                puEditField({id, name, description, isForAllPeople}, (newField) => {
                    let deleted = newField.deleted
                    if (deleted) {
                        fieldDeleted = true
                        $element.remove()
                        udFieldDefCb(isForAllPeople)
                        return
                    }

                    name = newField.name
                    description = newField.description

                    
                    
                    
                    $label.html(newField.name)
                    assOps()

                    udFieldDefCb(isForAllPeople)
                })
            })

            $label.append($operations)
        }

        assOps()
    }

    return [$element, validate, getValue2, vlChanged2]
}

function puEditP(fieldValues, personId, udSuccCb) {
    let fFacReturnVal = []
    let newFieldForAllP = false
    let hasNewFForP = false

    function udFieldDefCb(fieldDefUdForAllPP) {
        hasNewFForP = true
        newFieldForAllP = newFieldForAllP || fieldDefUdForAllPP
    }
    bigPopUp('', {
        zIndex: 110000,
        script: $popUp => {
            fieldValues = makeCopy(fieldValues)
            fieldValues.find(({code}) => code == 'gender').type = 'GENDER'
            let $from = $('<form class="row g-3" style="--cui-gutter-y: 3rem; --cui-gutter-x: 4rem;"></form>')
            fFacReturnVal = fieldValues.map(fV => {
                fV.personId = personId
                return gen$fInput(fV, udFieldDefCb)
            })
            $from.append(fFacReturnVal.map(i => i[0]))

            let $addField = $(`<div class="col-12" style="margin-top: 5rem;">
                <button type="button" class="btn btn-light"><svg class="icon me-2"><use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-plus"></use></svg> Thêm trường thông tin</button>
            </div>`)
            $addField.find('button').click(() => {
                puAddField(personId, function addFSuccCb(newFieldDef) {
                    newFieldForAllP = newFieldDef.isForAllPeople
                    hasNewFForP = true

                    let temp = gen$fInput(newFieldDef, udFieldDefCb)
                    $addField.before(temp[0])
                    fFacReturnVal.push(temp)
                })
            })
            $from.append($addField)
        
            $popUp.find('.content').append($from)
        },
        hideClBtn: true,
        buttons: [
            {
                html: 'Thoát',
                click: $popUp => {
                    if (hasNewFForP) {
                        udSuccCb(personId, [], false, true, newFieldForAllP)
                    }
                    $popUp.remove()
                }
            },
            {
                html: 'Lưu thay đổi',
                type: 'success',
                click: $popUp => {
                    if (fFacReturnVal.every(i => i[1]())) { 
                        let filterChanged = fFacReturnVal.filter(i => i[3]())
                        function udSucc(valChanged = true) {
                            $popUp.remove()
                            if (valChanged) {
                                let udRelShip = fieldValues.some(({code}) => ['father', 'mother', 'gender'].includes(code))
                                udSuccCb(personId, fieldValues, udRelShip, hasNewFForP, newFieldForAllP)
                            }
                        }

                        if (filterChanged.length == 0) {
                            if (hasNewFForP) {
                                $popUp.remove()
                                udSuccCb(personId, [], false, true, newFieldForAllP)
                                return
                            }
                            udSucc(false)
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
                            
                            api.updateFieldValues({data}).then(udSucc)
                        }
                    }
                }
            }
        ]
    })
}

let udCbStack = []
function puViewP(person, udCbIdx, zIndex = pUViewPBsIdx, firstTime = false, toSaveAsPdf = false) {
    let {callname, gender, birthday, deathday, avatar, id, isStandForUser} = person
    let showedPId = id
    let html = `
        <div class="row" style="margin-bottom: 3rem; box-sizing: content-box; overflow-x: hidden;">
            <div class="row col-md-4" style="display: flex; justify-content: center; align-items: center; box-sizing: content-box;">
                <img src="${avatar || defAvtUrl}" alt="" class="my-img card-border" style="height: 12rem; padding: 0; width: unset;">
            </div>
            <div class="row col-md-8" style="display: flex; align-items: center;">
                <div class="row">
                    <div class="col-md-12">
                        <h1>${callname}</h1>
                        <h4>Giới tính: ${gender}</h4>
                        <h4>Ngày sinh: ${birthday || 'Không rõ'}</h4>
                        <h4>Ngày mất: ${deathday ? `${DateLib.lDateToDate(deathday)} (${deathday} âm lịch)` : 'Không rõ'}</h4>
                    </div>
                </div>
            </div>
        </div>

        <div class="row" style="box-sizing: content-box; overflow-x: hidden;">
            <div class="row col-xl-4 col-lg-6" style="box-sizing: content-box;">
                <div style="padding: 0.7rem;">
                    <table class="table border mb-0 rel-pp">
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
            </div>
            <div class="row col-xl-8 col-lg-6 fields" style="box-sizing: content-box; height: max-content;">
            
            </div>
        </div>
    `

    if (!toSaveAsPdf) {
        udCbStack[udCbIdx + 1] = function innerUdCb(personId, fVChanged, udRelShip, udPHasNewField = false, allPPHasNewField = false) {
            
            
            
            
            
    
            udCbStack[udCbIdx](personId, fVChanged, udRelShip, false, allPPHasNewField)
    
            
            if (udPHasNewField || allPPHasNewField || udRelShip || (personId == showedPId)) {
                $popUp.remove()
                udCbStack[udCbIdx + 1] = null
    
                let nPuClosed = false
                bigPopUp('', {
                    zIndex,
                    script: ($popUp, _, rmCb) => {
                        api.getPBsInf({id: showedPId}).then(person => {
                            if (nPuClosed) return
                            $popUp.remove()
                            rmCb()
                            puViewP(person, udCbIdx, zIndex, firstTime)
                        })
                    },
                    clCb: () => {
                        if (firstTime) $(document.body).removeClass('stScroll')
                        udCbStack.pop()
                    }
                })
    
                return
            }
    
            let newPerson = {id: personId}
            fVChanged.forEach(({code, value}) => {
                newPerson[code] = value
            })
    
            $popUp.find('.p-ref-wrap').each((index, elem) => {
                elem.udCb(newPerson)
            })
        }
    }

    let blobInfo = null
    
    let fVFull = null
    let $popUp = bigPopUp(html, {
        zIndex,
        script: ($popUp) => {
            $popUp.find('.content').css('padding', '1.4rem')
            let $editButton = null
            let $downloadBtn = null
            let $deleteBtn = null
            $popUp.find('button').each((index, button) => {
                let $button = $(button)
                if ($button.find('svg').length != 0 && $button.html().includes('Chỉnh sửa thông tin')) {
                    $editButton = $button
                }
                if ($button.find('svg').length != 0 && $button.html().includes('Tải thông tin')) {
                    $downloadBtn = $button
                }
                if ($button.find('svg').length != 0 && $button.html().includes('Xóa người thân')) {
                    $deleteBtn = $button
                }
            })
            $editButton.hide()
            $downloadBtn.hide()
            $deleteBtn.hide()

            if (toSaveAsPdf) {
                $popUp.css({
                    width: '100%',
                    right: 'unset',
                    left: '100%'
                })
            }

            api.getPDeatilInf({id}).then(({id, father, mother, spouse, fieldValues, siblings, children}) => {
                fVFull = [...fieldValues]
                $editButton.show()
                $downloadBtn.show()
                if (isStandForUser) $deleteBtn.remove()
                else $deleteBtn.show()

                fieldValues = fieldValues.filter(({fieldDefinitionCode, code}) => !code && !fieldDefinitionCode)
                $popUp.find('.rel-pp tbody .loading').remove()
                
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

                    let sameFtIds = sameFather.map(({id}) => id)
                    let sameMtIds = sameMother.map(({id}) => id)
                    let sameFtIdsSet = new Set(sameFtIds)
                    let sameMtIdsSet = new Set(sameMtIds)

                    let sameFtOnly = sameFather.filter(({id}) => !sameMtIdsSet.has(id))
                    let sameMtOnly = sameMother.filter(({id}) => !sameFtIdsSet.has(id))
                    let sameBothFtAndMt = sameFather.filter(({id}) => sameMtIdsSet.has(id) && id != showedPId)

                    parts.push(sameBothFtAndMt, sameFtOnly, sameMtOnly)
                    texts.push('Anh em', 'Anh em cùng cha khác mẹ', 'Anh em cùng mẹ khác cha')
                } else if (children.length == 0 && (!spouse)) {
                    $popUp.find('.rel-pp tbody').append(`<tr>
                        <td></td>
                        <td>Không có thông tin</td>
                    </tr>`)
                }

                parts.push(children)
                texts.push('Con ruột')

                parts.forEach((part, i) => {
                    part.forEach(relPerson => {
                        let {avatar, id, callname} = relPerson

                        let $element = $(`<tr style="cursor: pointer;" class="p-ref-wrap">
                            <td class="text-center" style="vertical-align: middle;">
                                <div class="avatar avatar-md">
                                    <img class="avatar-img my-img card-border person-reference-img" src="${avatar || defAvtUrl}">
                                </div>
                            </td>
                            <td>
                                <div class="p-ref-name">${callname}</div>
                                <div class="small text-medium-emphasis">${texts[i]}</div>
                            </td>
                        </tr>`)
                        .click(() => puViewP(relPerson, udCbIdx + 1, zIndex + 1))
                        .on('mouseenter', function () { $(this).css('background-color', '#f7f7f9') })
                        .on('mouseleave', function () { $(this).css('background-color', 'white') })

                        $popUp.find('.rel-pp tbody').append($element)

                        $element[0].udCb = (newPerson) => {
                            if (newPerson.id != id) return
                            Object.assign(relPerson, newPerson)

                            $element.find('.person-reference-img').attr('src', newPerson.avatar || defAvtUrl)
                            $element.find('.p-ref-name').html(newPerson.callname)
                        }
                    })
                })

                fieldValues.forEach(fieldValue => {
                    $popUp.find('.row > .fields').append(gen$fDisplay(Object.assign(fieldValue, { pTypeAddonInf: {udCbIdx: udCbIdx + 1, zIndex: zIndex + 1} })))
                })

                if (toSaveAsPdf) {
                    let $elem = $popUp.find('.pop-up > .content').css({
                        'overflow-y': 'unset'
                    })

                    domtoimage.toPng($elem[0], { bgcolor: 'white',
                        style: {
                            height: 'unset'
                        }
                    }).then(blob => { blobInfo = [blob, $elem.innerHeight(), $elem.innerWidth()] })
                }
            })
        },
        clCb: () => {
            if (firstTime) $(document.body).removeClass('stScroll')
            udCbStack.pop()
        },
        buttons: [
            {
                html: '<svg class="icon me-2"><use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-trash"></use></svg><span> Xóa người thân</span>',
                type: 'danger',
                click: _$popUp => {
                    popUpConfirm('Bạn có chắc chắn muốn xóa người thân này không', () => {
                        let rmLding = popUpLoading()
                        _$popUp.remove()
                        api.deletePerson({id}).then(() => {
                            rmLding()
                            $popUp.remove()
                            if (firstTime) $(document.body).removeClass('stScroll')
                            udCbStack[udCbIdx](showedPId, [], true, false, false)
                            udCbStack.pop()
                        })
                    })
                }
            },
            {
                html: '<svg class="icon me-2"><use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-data-transfer-down"></use></svg><span> Tải thông tin</span>',
                type: 'success',
                click: ($popUp) => {
                    domtoimage.toPng($popUp.find('.pop-up > .content')[0], { bgcolor: 'white',
                        style: {
                            height: 'unset'
                        }
                    }).then((dataUrl) => {
                        let link = document.createElement('a')
                        link.href = dataUrl
                        link.download = `Thông tin về ${callname}`
                        link.click()
                    })
                }
            },
            {
                html: '<svg class="icon me-2"><use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-pen-alt"></use></svg><span> Chỉnh sửa thông tin</span>',
                type: 'info',
                click: () => puEditP(fVFull, id, udCbStack[udCbIdx + 1])
            }
        ]
    })

    if (!toSaveAsPdf) return Promise.resolve()

    return new Promise(resolve => {
        let deltaTime = 500
        function checkBlob() {
            if (blobInfo) {
                $popUp.remove()
                resolve(blobInfo)
            } else {
                setTimeout(checkBlob, deltaTime)
            }
        }
        checkBlob()
    })
}

function gen$fDisplay({id, code, type, placeholder, name, isMultiValue, value, pTypeAddonInf}) {
    
    value = value || ''
    let $element
    let randomId = () => `${Math.round(Math.random()*10E12)} r o t c e n o C y l i m a F`.split(' ').reverse().join('')
    let labelId = randomId()

    if (isMultiValue) {
        switch (type) {
            case 'STRING':
                let maxLength = (value && value != '') ? Math.max(...value.split(mulValDel).map(v => v.length)) : 0
                let cl = 'col-xl-6 col-lg-12 col-md-6'
                if (maxLength > 400) {
                    cl = 'col-12'
                }
                $element = $(`<div style="padding: 0.7rem;" class="${cl}">
                    <div class="card" style="">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><h5 style="margin-top: 0.5rem;">${name}</h5></li>
                            ${value == '' ? '<li class="list-group-item"><h6 class="text-muted">Không có giá trị nào!</h6></li>' : ''}
                            ${value != '' ? value.split(mulValDel).map(v => `<li class="list-group-item">${v}</li>`).join('') : ''}
                        </ul>
                    </div>
                </div>`)
                break
            case 'DATE':
                $element = $(`<div style="padding: 0.7rem;" class="col-xl-6 col-lg-12 col-md-6">
                    <div class="card" style="">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><h5 style="margin-top: 0.5rem;">${name}</h5></li>
                            ${value == '' ? '<li class="list-group-item"><h6 class="text-muted">Không có giá trị nào!</h6></li>' : ''}
                            ${value != '' ? value.split(mulValDel).map(v => `<li class="list-group-item">${v}</li>`).join('') : ''}
                        </ul>
                    </div>
                </div>`)
                break
            case 'LUNAR_DATE':
                $element = $(`<div style="padding: 0.7rem;" class="col-xl-6 col-lg-12 col-md-6">
                    <div class="card" style="">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><h5 style="margin-top: 0.5rem;">${name}</h5></li>
                            ${value == '' ? '<li class="list-group-item"><h6 class="text-muted">Không có giá trị nào!</h6></li>' : ''}
                            ${value != '' ? value.split(mulValDel).map(v => `<li class="list-group-item">${DateLib.lDateToDate(v)} ~ ${v} âm lịch</li>`).join('') : ''}
                        </ul>
                    </div>
                </div>`)
                break
            case 'PERSON':
                $element = $(`<div style="padding: 0.7rem;" class="col-xl-6 col-lg-12 col-md-6">
                    <div class="card" style="">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><h5 style="margin-top: 0.5rem;">${name}</h5></li>
                            ${value == '' ? '<li class="list-group-item"><h6 class="text-muted">Không có người nào cả!</h6></li>' : ''}
                        </ul>
                    </div>
                </div>`)

                value.split(mulValDel).forEach(id => {
                    if (id == '') return

                    let $person = $(`<li class="list-group-item p-ref-wrap" style="cursor: pointer;">
                        <div class="person" style="display: flex; align-items: center;">
                            <img src="" class="my-img card-border person-reference-image" style="display: none; height: 2.5rem; margin-right: 1.25rem;">
                            <div class="name p-ref-name" style="display: none;"></div>
                            <div class="loading">Đang tải...</div>
                        </div>
                    </li>`)

                    $element.find('.card .list-group').append($person)

                    api.getPBsInf({id}).then(person => {
                        $person.find('.loading').remove()
                        $person.find('img').attr('src', person.avatar || defAvtUrl).show()
                        $person.find('.name').html(person.callname).show()
    
                        $person.click(() => puViewP(person, pTypeAddonInf.udCbIdx, pTypeAddonInf.zIndex))
                            .on('mouseenter', function () { $(this).css('background-color', '#f7f7f9') })
                            .on('mouseleave', function () { $(this).css('background-color', 'white') })

                        $person[0].udCb = (newPerson) => {
                            if (newPerson.id != id) return
                            Object.assign(person, newPerson)
    
                            $element.find('.person-reference-img').attr('src', newPerson.avatar || defAvtUrl)
                            $element.find('.p-ref-name').html(newPerson.callname)
                        }
                    })
                })
                break
            case 'IMAGE':
                $element = $(`<div style="padding: 0.7rem;" class="col-12">
                    <div class="card" style="">
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
                    value.split(mulValDel).forEach(src => {
                        let $imgWrap = $(`<div style="padding: 0.5rem;">
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
                let cl = 'col-xl-6 col-lg-12 col-md-6'
                if (value.length > 400) {
                    cl = 'col-12'
                }
                $element = $(`<div class="${cl}" style="padding: 0.7rem;">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${name}</h5>
                            ${value == '' ?
                                '<h6 class="text-muted">Không có giá trị!</h6>' : 
                                `<p class="card-text">${value.replaceAll('\n', '<br>')}</p>`
                            }
                        </div>
                    </div>
                </div>`)
                break
            case 'DATE':
                $element = $(`<div class="col-xl-6 col-lg-12 col-md-6" style="padding: 0.7rem;">
                    <div class="card">
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
                $element = $(`<div class="col-xl-6 col-lg-12 col-md-6" style="padding: 0.7rem;">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${name}</h5>
                            ${value == '' ?
                                '<h6 class="text-muted">Không có giá trị!</h6>' : 
                                `<p class="card-text">${DateLib.lDateToDate(value)}</p><h6 class="card-subtitle mb-2 text-muted">${value} âm lịch</h6>`
                            }
                        </div>
                    </div>
                </div>`)
                break
            case 'PERSON':
                $element = $(`<div class="col-xl-6 col-lg-12 col-md-6" style="padding: 0.7rem;">
                    <div class="card">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><h5 style="margin-top: 0.5rem;">${name}</h5></li>
                            ${value == '' ? '<li class="list-group-item"><h6 class="text-muted">Không có người nào cả!</h6></li>' : ''}
                            ${value != '' ? `<li class="list-group-item person-wrap p-ref-wrap" style="cursor: pointer;">
                                <div class="person" style="display: flex; align-items: center;">
                                    <img src="" class="my-img card-border person-reference-img" style="display: none; height: 2.5rem; margin-right: 1.25rem;">
                                    <div class="name p-ref-name" style="display: none;"></div>
                                    <div class="loading">Đang tải...</div>
                                </div>
                            </li>` : ''}
                        </ul>
                    </div>
                </div>`)

                if (value != '') {
                    let $person = $element.find('.card .person-wrap')

                    api.getPBsInf({id: value}).then(person => {
                        $person.find('.loading').remove()
                        $person.find('img').attr('src', person.avatar || defAvtUrl).show()
                        $person.find('.name').html(person.callname).show()
    
                        $person.click(() => puViewP(person, pTypeAddonInf.udCbIdx, pTypeAddonInf.zIndex))
                            .on('mouseenter', function () { $(this).css('background-color', '#f7f7f9') })
                            .on('mouseleave', function () { $(this).css('background-color', 'white') })

                        $person[0].udCb = (newPerson) => {
                            if (newPerson.id != id) return
                            Object.assign(person, newPerson)
        
                            $element.find('.person-reference-img').attr('src', newPerson.avatar || defAvtUrl)
                            $element.find('.p-ref-name').html(newPerson.callname)
                        }
                    })
                }
                break
            case 'IMAGE':
                $element = $(`<div class="col-xl-6 col-lg-12 col-md-6" style="padding: 0.7rem;">
                    <div class="card">
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

function headLog(m, append = false) {
    let $con = $('#main > header > div #headLog')
    $con.text(m)
}

function load(user) {
    $('#logout').click(() => {
        api.logout().then(() => {
            window.location.href = './login.html'
        })
    })
    function tPPMng() {
        $('#t-people-mng').html(`
            <button type="button" class="btn btn-primary" style="margin-bottom: 12px; margin-right: 1rem;" id="add-person">
                <svg class="icon">
                <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-user-plus"></use>
                </svg> Thêm người thân
            </button>
            <button type="button" class="btn btn-primary" style="margin-bottom: 12px; margin-right: 1rem;" id="save-pdf">
                <svg class="icon">
                <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-save"></use>
                </svg> Tải tất cả thông tin thành PDF
            </button>
            <button type="button" class="btn btn-primary" style="margin-bottom: 12px; margin-right: 1rem;" id="dl-backup">
                <svg class="icon">
                <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-cloud-download"></use>
                </svg> Tải file sao lưu
            </button>
            <button type="button" class="btn btn-primary" style="margin-bottom: 12px; margin-right: 1rem;" id="restore">
                <svg class="icon">
                <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-cloud-upload"></use>
                </svg> Nạp file sao lưu
            </button>
            <input type="file" accept=".csv, .json" hidden id="input-csv"/>
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
                #t-people-mng table thead tr th {
                background-color: darkgray;
                }
                #t-people-mng table tbody {
                background-color: white;
                }
            </style>
        `)

        let outerPeople = null

        function rfPPList() {
            api.getPPBsInf().then(people => {
                outerPeople = people
                $("#list-people").html('')
                people.forEach(person => {
                    let {callname, gender, birthday, deathday, father, mother, avatar, spouse} = person
                    let $person = $(`<tr class="align-middle" style="cursor: pointer;">
                        <td class="text-center">
                            <div class="avatar avatar-md">
                                <img class="avatar-img my-img card-border" src="${avatar || defAvtUrl}">
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
                            <div class="fw-semibold">${deathday ? `${deathday} (ÂL)` : '-'}</div>
                        </td>
                        <td class="text-center">
                            ${spouse ? `<div class="avatar avatar-md">
                                <img class="avatar-img my-img card-border" src="${spouse.avatar || defAvtUrl}">
                            </div>` : '-'}
                        </td>
                        <td class="text-center">
                            ${father ? `<div class="avatar avatar-md">
                                <img class="avatar-img my-img card-border" src="${father.avatar || defAvtUrl}">
                            </div>` : '-'}
                        </td>
                        <td class="text-center">
                            ${mother ? `<div class="avatar avatar-md">
                                <img class="avatar-img my-img card-border" src="${mother.avatar || defAvtUrl}">
                            </div>` : '-'}
                        </td>
                    </tr>`)
        
                    $("#list-people").append($person)
    
                    $person
                    .on('mouseenter', function () { $(this).css('background-color', '#f7f7f9') })
                    .on('mouseleave', function () { $(this).css('background-color', 'white') })
                    .click(() => {
                        $(document.body).addClass('stScroll')
                        udCbStack[0] = rfPPList
                        puViewP(person, 0, pUViewPBsIdx, true)
                    })
                })
            })
        }
    
        rfPPList()
    
        $('#add-person').click(() => {
            $(document.body).addClass('stScroll')
            puAddP(function addScCb () {
                rfPPList()
            })
        })

        $('#dl-backup').click(() => {
            let rmLding = popUpLoading()
            api.backup().then(({data}) => {
                function downloadData(data, filename = 'data.txt') {
                    let link = document.createElement("a")
                    link.href = URL.createObjectURL(new Blob([data], { type: 'text/plain' }))
                    link.download = filename
                    link.click()
                    
                    URL.revokeObjectURL(link.href)
                }
                let t = new Date()
                let ext = (data.startsWith('{') || data.startsWith('[')) ? 'json' : 'csv' 
                downloadData(data, `backup-QLGP_${t.getDate()}-${t.getMonth() + 1}-${t.getFullYear()}.${ext}`)
                rmLding()
            })
        })

        $('#restore').click(() => {
            $('#input-csv').click()
        })

        $('#input-csv').change(function () {
            let rmLding = popUpLoading()
            let file = this.files ? this.files[0] : null
            if (!file) return
            let reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                let data = evt.target.result;
                api.restore({data}).then(({message}) => {
                    if (message != 'Invalid data!') {
                        window.location.href = window.location.href
                    } else {
                        popUpMessage('Dữ liệu không hợp lệ!')
                        rmLding()
                    }
                })
            }
            reader.onerror = function (evt) {
                rmLding()
            }
        })

        $('#save-pdf').click(() => {
            let rmLding = popUpLoading()
            Promise.all(outerPeople.map(person => puViewP(person, 0, pUViewPBsIdx, false, true))).then(blobs => {
                let pdf = new jspdf.jsPDF("p", "mm", "a4")
                let width = pdf.internal.pageSize.getWidth()
                let height = pdf.internal.pageSize.getHeight()

                for (let i = 0; i < blobs.length; i++) {
                    if (i != 0 ) pdf.addPage()
                    
                    let imgWidth = width
                    let imgHeight = blobs[i][1]*width/blobs[i][2]

                    if (imgHeight > height) {
                        imgHeight = height
                        imgWidth = blobs[i][2]*height/blobs[i][1]
                    }

                    pdf.addImage(blobs[i][0], 'PNG', 0, 0, imgWidth, imgHeight)
                }

                pdf.save("QLGP.pdf")
                rmLding()
            })
        })
    }
    tPPMng() 

    function tFTree() {
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
                hasRelMainBranch: true,
                hasRelShip: false
            },
            targetPersonId: null,
            props: {
                default: {
                    height: 180,
                    width: 360
                },
                minWidth: {
                    height: 600,
                    width: 300
                },
                hDis: 80,
                vDis: 120
            }
        }
        let lastViewStatus = {}

        let bakAncestor = null

        function createTree() {
            let $tab = $('#t-fmTree')
                .append('<div style="height: 100%; width: 100%; position: relative; overflow: hidden;"></div>').find('div')
                .append('<div style="transform-origin: 0px 0px; left: 0; top: 0; position: absolute;"></div>').find('div')

            let props = config.props[config.layout.minWidth ? 'minWidth' : 'default']
            props.hDis = config.props.hDis
            props.vDis = config.props.vDis

            let $tgPerCard = null
            let $fPCard = null
            function genPCard(person, asSpouse = false) {
                let {id, callname, gender, birthday, deathday, father, mother, spouse, avatar, isStandForUser} = person

                let $card = $(`<div class="card ${config.layout.minWidth ? 'vert-card' : ''}" style="height: ${props.height}px; width: ${props.width}px; position: relative;">
                    <div class="row g-0" style="height: 100%;">
                        ${config.show.image ? `<div class="col-${config.layout.minWidth ? 12 : 4}" style="height: ${config.layout.minWidth ? 50 : 100}%;">
                            <img src="${avatar || defAvtUrl}" class="img-fluid rounded-start" style="object-fit: cover; height: 100%; width: 100%; border-radius: 0 !important;
                            border-top-left-radius: 0.375rem !important; ${config.layout.minWidth ? 'border-top-right-radius: 0.375rem !important;' :
                            'border-bottom-left-radius: 0.375rem !important;'}">
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

                    ${father ? '' : `<button type="button" class="btn btn-primary btn-sm hoverShow add-father" style="z-index: 3; position: absolute; left: 0; bottom: calc(100% + 8px);">Thêm bố</button>`}
                    ${mother ? '' : `<button type="button" class="btn btn-primary btn-sm hoverShow add-mother" style="z-index: 3; position: absolute; right: 0; bottom: calc(100% + 8px);">Thêm mẹ</button>`}
                    ${spouse ? '' : `<button type="button" class="btn btn-primary btn-sm hoverShow add-spouse" style="z-index: 3; position: absolute; right: 0; top: calc(100% + 8px);">Thêm vợ/chồng</button>`}
                    <button type="button" class="btn btn-primary btn-sm hoverShow add-child" style="z-index: 3; position: absolute; left: 0; top: calc(100% + 8px);">Thêm con</button>

                    <div class="hoverShow" style="z-index: 2; position: absolute; width: 100%; left: 0; height: 2rem; bottom: 100%;"></div>
                    <div class="hoverShow" style="z-index: 2; position: absolute; width: 100%; left: 0; height: 2rem; top: 100%;"></div>
                </div>`)

                if (id == config.targetPersonId) {
                    if (!asSpouse) $tgPerCard = $card
                    else if (!$tgPerCard) $tgPerCard = $card
                }
                if (id == lastViewStatus.fcPerId) {
                    if (!asSpouse) $fPCard = $card
                    else if (!$fPCard) $fPCard = $card
                }

                if (isMobile) {
                    let $show = $(`<button type="button" class="btn btn-primary btn-sm hoverShow" style="z-index: 3; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);">Xem chi tiết</button>`)
                    $show.click(e => {
                        e.stopPropagation()
                        udCbStack[0] = () => {
                            $('#t-fmTree').html('')
                            lastViewStatus.fcPerId = id
                            createTree()
                        }
                        puViewP(person, 0, pUViewPBsIdx, true)
                    })
                    $card.append($show)
                    $card.append('<div class="hoverShow" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0; background-color: white; opacity: 0.5;"></div>')

                    $card.click(() => {
                        if (!isClickEvent()) return
                        let isShowing = $card.find('.hoverShow').hasClass('cpp-ops')
                        
                        if (isShowing) {
                            $card.find('.hoverShow').hide().removeClass('cpp-ops')
                        }
                        else {
                            $('.hoverShow').hide().removeClass('cpp-ops')
                            $card.find('.hoverShow').show().addClass('cpp-ops')
                        }
                    })
                }
                else {
                    $card.click(() => {
                        if (!isClickEvent()) return
                        udCbStack[0] = () => {
                            $('#t-fmTree').html('')
                            lastViewStatus.fcPerId = id
                            createTree()
                        }
                        puViewP(person, 0, pUViewPBsIdx, true)
                    })

                    $card.mouseover(() => $card.css('cursor', 'pointer').find('.hoverShow').show())
                    $card.mouseleave(() => $card.css('cursor', 'unset').find('.hoverShow').hide())
                }

                $card.find('.hoverShow').hide()

                let tempHtml = `
                    <h3>Bạn muốn thêm <span style="color: #2eb85c;">ROLE</span> cho <span style="color: #2eb85c;">${callname}</span> bằng cách nào?</h3>
                    <div style="margin-top: 40px;" id="from-list"><button type="button" class="btn btn-primary">Chọn từ danh sách</button></div>
                    <div style="margin-top: 20px;" id="create-new"><button type="button" class="btn btn-primary">Tạo một người mới</button></div>
                `

                function addonCb() {
                    $('#t-fmTree').html('')
                    lastViewStatus.fcPerId = id
                    lastViewStatus.scale = getZoom()
                    createTree()
                }

                $card.find('button.add-father').click((e) => {
                    e.stopPropagation()
                    
                    bigPopUp(tempHtml.replace('ROLE', 'bố'), {
                        script: ($popUp) => {
                            $popUp.find('#from-list').click(() => {
                                puPickP(([person]) => {
                                    if (!person) return
                                    $popUp.remove()
                                    let rmLding = popUpLoading()

                                    api.updateFieldValues({
                                        data: [{
                                            value: person.id,
                                            personId: id,
                                            fieldDefinitionCode: 'father'
                                        }]
                                    }).then(() => {
                                        rmLding()
                                        addonCb()
                                    })
                                }, {
                                    maleOnly: true,
                                    exceptIds: [id]
                                })
                            })

                            $popUp.find('#create-new').click(() => {
                                puAddP(() => {
                                    $popUp.remove()
                                    addonCb()
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
                                puPickP(([person]) => {
                                    if (!person) return
                                    $popUp.remove()
                                    let rmLding = popUpLoading()

                                    api.updateFieldValues({
                                        data: [{
                                            value: person.id,
                                            personId: id,
                                            fieldDefinitionCode: 'mother'
                                        }]
                                    }).then(() => {
                                        rmLding()
                                        addonCb()
                                    })
                                }, {
                                    femaleOnly: true,
                                    exceptIds: [id]
                                })
                            })

                            $popUp.find('#create-new').click(() => {
                                puAddP(() => {
                                    $popUp.remove()
                                    addonCb()
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
                    
                    bigPopUp(tempHtml.replace('ROLE', 'vợ/chồng'), {
                        script: ($popUp) => {
                            $popUp.find('#from-list').click(() => {
                                puPickP(([person]) => {
                                    if (!person) return
                                    $popUp.remove()
                                    let rmLding = popUpLoading()

                                    api.updateFieldValues({
                                        data: [{
                                            value: person.id,
                                            personId: id,
                                            fieldDefinitionCode: 'spouse'
                                        }]
                                    }).then(() => {
                                        rmLding()
                                        addonCb()
                                    })
                                }, {
                                    exceptIds: [id]
                                })
                            })

                            $popUp.find('#create-new').click(() => {
                                puAddP(() => {
                                    $popUp.remove()
                                    addonCb()
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
                                puPickP(([person]) => {
                                    if (!person) return
                                    $popUp.remove()
                                    let rmLding = popUpLoading()

                                    api.updateFieldValues({
                                        data: [{
                                            value: id,
                                            personId: person.id,
                                            fieldDefinitionCode: (gender == 'Nam') ? 'father' : 'mother'
                                        }]
                                    }).then(() => {
                                        rmLding()
                                        addonCb()
                                    })
                                }, {
                                    exceptIds: [id]
                                })
                            })

                            $popUp.find('#create-new').click(() => {
                                puAddP(() => {
                                    $popUp.remove()
                                    addonCb()
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

            let drwLineCbs = []
            function genFGroup(person) {
                let id1 = randomId()
                let id2 = randomId()
                let id3 = randomId()
                let id4 = randomId()

                let $group = $(`<div class="">
                    <div class="parent" id="${id1}"></div>
                    <div class="children" id="${id2}"></div>
                </div>`)
                .css({
                    padding: `${props.vDis}px ${props.hDis/2}px 0`,
                    'padding-bottom': '0',
                    width: 'max-content',
                    position: 'relative'
                })
                $group.find('#'+id1).css({
                    display: 'flex',
                    'justify-content': 'center'
                })
                $group.find('#'+id2).css({
                    display: 'flex',
                    width: 'max-content'
                })

                let $card = genPCard(person).attr('id', id3)
                $group.find('#'+id1).append($card)

                let allChildren = person.children || []
                let chrCardId = []
                let chdrNotHasPartner = allChildren.filter(({partner}) => !partner)
                let chrNotHaPCardId = []
                let chrHasPrtSameSpouse = allChildren.filter(({partner}) => partner && partner.id == person.spouse?.id)
                let chrHasParSameSpouseCardId = []
                let cPnDiffSp = allChildren.filter(({partner}) => partner && partner.id != person.spouse?.id)
                let gChrHasPnDiffSrc = {}
                cPnDiffSp.forEach(({partner, child}) => {
                    let id = partner.id
                    if (gChrHasPnDiffSrc[id]) {
                        gChrHasPnDiffSrc[id].children.push(child)
                    } else {
                        gChrHasPnDiffSrc[id] = {
                            children: [child],
                            partner
                        }
                    }
                })
                let idsPartDiffSpouse = Object.keys(gChrHasPnDiffSrc)
                let prtToCardId = {}
                let prtIdToCCardId = {}
                idsPartDiffSpouse.forEach(id => prtIdToCCardId[id] = [])

                chdrNotHasPartner.forEach(({child}) => {
                    let $childCard = genFGroup(child)
                    let rdId = randomId()
                    chrNotHaPCardId.push(rdId)
                    chrCardId.push(rdId)
                    $group.find('#'+id2).append($childCard.attr('id', rdId))
                })

                chrHasPrtSameSpouse.forEach(({child}) => {
                    let $childCard = genFGroup(child)
                    let rdId = randomId()
                    chrHasParSameSpouseCardId.push(rdId)
                    chrCardId.push(rdId)
                    $group.find('#'+id2).append($childCard.attr('id', rdId))
                })

                for(let partnerId of idsPartDiffSpouse) {
                    gChrHasPnDiffSrc[partnerId].children.forEach(child => {
                        let $childCard = genFGroup(child)
                        let rdId = randomId()
                        prtIdToCCardId[partnerId].push(rdId)
                        chrCardId.push(rdId)
                        $group.find('#'+id2).append($childCard.attr('id', rdId))
                    })
                }

                let drawPartner = (config.targetPeople.showWifes && person.gender == 'Nam') || config.targetPeople.hasRelMainBranch
                if (drawPartner) {
                    if (person.spouse) {
                        $group.find('#'+id1).append(`<div style="width: ${props.hDis}px;"></div>`)
                        let $spouseCard = genPCard(person.spouse, true)
                        $group.find('#'+id1).append($spouseCard.attr('id', id4))
                    }

                    idsPartDiffSpouse.forEach(id => {
                        $group.find('#'+id1).append(`<div style="width: ${props.hDis}px;"></div>`)
                        let $partnerCard = genPCard(gChrHasPnDiffSrc[id].partner, true)
                        let rdId = randomId()
                        prtToCardId[id] = rdId
                        $group.find('#'+id1).append($partnerCard.attr('id', rdId))
                    })
                }

                if ((drawPartner && person.spouse) || allChildren.length != 0) {
                    function drawLine(x1, y1, x2, y2, padding1 = false, padding2 = false) {
                        let lineWidth = 8
                        let lineHeight = Math.sqrt((x1 - x2)**2 + (y1 - y2)**2)
                        let lineBg = true ? 'black' : `rgb(${Math.floor(Math.random()*256)}, ${Math.floor(Math.random()*256)}, ${Math.floor(Math.random()*256)})`
                        
                        if (padding1) {
                            
                            lineHeight += lineWidth/2
                            let [a, b] = [x1 - x2, y1 - y2]
                            x1 += (lineWidth/2)*a/Math.sqrt(a**2 + b**2)
                            y1 += (lineWidth/2)*b/Math.sqrt(a**2 + b**2)
                        }
                        if (padding2) {
                            
                            lineHeight += lineWidth/2
                            let [a, b] = [x2 - x1, y2 - y1]
                            x2 += (lineWidth/2)*a/Math.sqrt(a**2 + b**2)
                            y2 += (lineWidth/2)*b/Math.sqrt(a**2 + b**2)
                        }

                        let line = $('<div></div>').css({
                            height: lineWidth+'px',
                            width: lineHeight+'px',
                            position: 'absolute',
                            left: ((x1+x2)/2 - lineHeight/2)+'px',
                            top: ((y1+y2)/2 - lineWidth/2)+'px',
                            transform: `rotate(${Math.atan((y2-y1)/(x2-x1))*180/Math.PI}deg)`,
                            'background-color': lineBg,
                        })

                        $group.append(line)
                    }

                    drwLineCbs.push(function draw() {
                        let $person = $group.find('#'+id3)
                        let pPos = $person.position()
                        let pHeight = $person.outerHeight()
                        let pWidth = $person.outerWidth()

                        let horiLineY = null

                        function getCCardStyle(childCardId) {
                            let $childCard = $group.find(`#${childCardId}`)
                            let temp = $childCard.position()
                            let top1 = temp.top, left1 = temp.left

                            let $cCardFPar = $group.find(`#${childCardId} > .parent > div:first-child`)
                            temp = $cCardFPar.position()
                            let top2 = temp.top, left2 = temp.left
                            
                            return {
                                top: top1 + top2,
                                left: left1 + left2,
                                height: $cCardFPar.outerHeight(),
                                width: $cCardFPar.outerWidth()
                            }
                        }

                        if (chrCardId.length != 0) {
                            horiLineY = ((pPos.top + pHeight) + getCCardStyle(chrCardId[0]).top)/2
                        }

                        let hozRanges = [] 

                        function drawConnLines(cardIds, x, y) {
                            if (cardIds.length == 0) return

                            let cardIdToInf = {}
                            cardIds.forEach(cardId => {
                                cardIdToInf[cardId] = getCCardStyle(cardId)
                            })
                            let firstCardId = cardIds[0]

                            let lastHozRange = hozRanges.length > 0 ? hozRanges[hozRanges.length - 1] : [-10e10, -10e10, false]

                            if (cardIds.length == 1) {
                                let x2 = cardIdToInf[firstCardId].left + cardIdToInf[firstCardId].width/2
                                let y2 = cardIdToInf[firstCardId].top
                                
                                if (x == x2) {
                                    drawLine(x, y, x2, y2)
                                }
                                else {
                                    let hozLineLeftToRight = (x < x2)
                                    let reduceYLevel = 0
                                    if ((hozLineLeftToRight && x <= lastHozRange[1]) || (!hozLineLeftToRight && x2 <= lastHozRange[1])) {
                                        reduceYLevel = lastHozRange[2] + (hozLineLeftToRight ? 1 : -1)
                                    }
                                    let reduceY = 0
                                    if (reduceYLevel > 0) {
                                        reduceY = config.props.vDis/2 - config.props.vDis/2/(2**reduceYLevel)
                                    } else if (reduceYLevel < 0) {
                                        reduceY = - (config.props.vDis/2 - config.props.vDis/2/(2**(-reduceYLevel)))
                                    }

                                    drawLine(x, y, x, horiLineY - reduceY, false, false)
                                    drawLine(x, horiLineY - reduceY, x2, horiLineY - reduceY, true, true)
                                    drawLine(x2, horiLineY - reduceY, x2, y2, false, false)

                                    hozRanges.push(hozLineLeftToRight ? [x, x2, reduceYLevel] : [x2, x, reduceYLevel])
                                }
                            }
                            else {
                                let horiLineX1 = cardIdToInf[firstCardId].left + cardIdToInf[firstCardId].width/2
                                let lastCardId = cardIds[cardIds.length - 1]
                                let horiLineX2 = cardIdToInf[lastCardId].left + cardIdToInf[lastCardId].width/2

                                let minX = Math.min(horiLineX1, horiLineX2, x)
                                let maxX = Math.max(horiLineX1, horiLineX2, x)

                                let reduceYLevel = 0
                                if (minX <= lastHozRange[1]) {
                                    reduceYLevel = lastHozRange[2] + (x < horiLineX1 ? 1 : -1)
                                }
                                let reduceY = 0
                                if (reduceYLevel > 0) {
                                    reduceY = config.props.vDis/2 - config.props.vDis/2/(2**reduceYLevel)
                                } else if (reduceYLevel < 0) {
                                    reduceY = - (config.props.vDis/2 - config.props.vDis/2/(2**(-reduceYLevel)))
                                }

                                if (horiLineX1 <= x && x <= horiLineX2) {
                                    drawLine(x, y, x, horiLineY - reduceY, false, false)
                                } else {
                                    drawLine(x, y, x, horiLineY - reduceY, false, false)
                                    drawLine(x, horiLineY - reduceY, (horiLineX1 + horiLineX2)/2, horiLineY - reduceY, true, true)
                                }
                                drawLine(horiLineX1, horiLineY - reduceY, horiLineX2, horiLineY - reduceY, true, true)

                                cardIds.forEach(cardId => {
                                    let vertLineX = cardIdToInf[cardId].left + cardIdToInf[cardId].width/2
                                    let vertLineY1 = horiLineY - reduceY
                                    let vertLineY2 = cardIdToInf[cardId].top

                                    drawLine(vertLineX, vertLineY1, vertLineX, vertLineY2, false, false)
                                })

                                hozRanges.push([minX, maxX, reduceYLevel])
                            }
                        }

                        
                        if (!drawPartner) {
                            drawConnLines(chrCardId, pPos.left + pWidth/2, pPos.top + pHeight)
                            return
                        }

                        

                        
                        if (chrNotHaPCardId.length != 0) {
                            drawConnLines(chrNotHaPCardId, pPos.left + pWidth/2, pPos.top + pHeight)
                        }
                        
                        
                        if (person.spouse) {
                            let $spouseCard = $group.find('#'+id4)
                            let x1 = pPos.left + pWidth
                            let x2 = $spouseCard.position().left
                            let y = pPos.top + pHeight/2
                            drawLine(x1, y, x2, y)

                            drawConnLines(chrHasParSameSpouseCardId, (x1 + x2)/2, y)
                        }

                        
                        let nPartnersDiffSpouse = idsPartDiffSpouse.length
                        idsPartDiffSpouse.forEach((partnerId, index) => {
                            let $partnerCard = $group.find('#'+prtToCardId[partnerId])
                            let partnerPos = $partnerCard.position()
                            let partnerWidth = $partnerCard.outerWidth()

                            let x1 = pPos.left + pWidth/2
                            let x2 = partnerPos.left + partnerWidth/2
                            let y = pPos.top - ((index + 1)/(nPartnersDiffSpouse + 1))*(horiLineY - pPos.top - pHeight)
                            drawLine(x1, y, x2, y, true, true)

                            drawLine(x1, y, x1, pPos.top, true, false)
                            drawLine(x2, y, x2, pPos.top, true, false)

                            drawConnLines(prtIdToCCardId[partnerId], x2 - partnerWidth/2 - config.props.hDis/2, y)
                        })
                    })
                }

                return $group
            }

            
            let isMobile = false;
            (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) isMobile = true;})(navigator.userAgent||navigator.vendor||window.opera);
            
            function zAccGenearatorPC() {
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

                let xBfMouDown, yBfMouDown
                let xMouUp, yMouUp
            
                zoom.onmousedown = function (e) {
                    e.preventDefault()
                    xBfMouDown = pointX
                    yBfMouDown = pointY
                    start = {
                        x: e.clientX - pointX,
                        y: e.clientY - pointY
                    }
                    panning = true
                }
            
                zoom.onmouseup = function (e) {
                    panning = false
                    xMouUp = pointX
                    yMouUp = pointY
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

                let moveToCard = ($card, speed = 0, end) => {
                    if (!$card) return

                    let height = $card.outerHeight()*scale
                    let width = $card.outerWidth()*scale
                    let documentHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
                    let documentWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
                    let mainPaddLeft = parseInt($('#main').css('padding-left').replace('px', ''))
                    if (isNaN(mainPaddLeft)) mainPaddLeft = 256
                    
                    let targetOffset = {
                        top: $('#header').outerHeight() + (documentHeight - $('#header').outerHeight())/2 - height/2,
                        left: mainPaddLeft + (documentWidth - mainPaddLeft)/2 - width/2
                    }

                    let realOffset = $card.offset()

                    if (speed <= 0) {
                        pointX = targetOffset.left - realOffset.left + pointX
                        pointY = targetOffset.top - realOffset.top + pointY
                        setTransform()
                        if (end) end()
                        return
                    }

                    let distance = Math.sqrt((targetOffset.left - realOffset.left)**2 + (targetOffset.top - realOffset.top)**2)
                    let duration = distance/(scale >= 1 ? scale : Math.sqrt(scale))/speed
                    if (duration < 200) {
                        duration = 800*Math.pow(duration/800, 1/6)
                    } else if (duration < 800) {
                        duration = 800*Math.pow(duration/800, 1/16)
                    }

                    $tab.animate({
                        left: `+=${targetOffset.left - realOffset.left}px`,
                        top: `+=${targetOffset.top - realOffset.top}px`
                    }, duration, () => {
                        pointX = targetOffset.left - realOffset.left + pointX
                        pointY = targetOffset.top - realOffset.top + pointY
                        setTransform()
                        $tab.css({
                            left: 0,
                            top: 0
                        })
                        if (end) end()
                    })
                }

                let isClickEvent = () => {
                    let delta = 1
                    return Math.abs(xMouUp - xBfMouDown) < delta && Math.abs(yMouUp - yBfMouDown) < delta
                }

                let getZoom = () => scale

                let setZoom = z => {
                    scale = z
                    setTransform()
                }

                return [moveToCard, isClickEvent, setZoom, getZoom]
            }
            function zAccGenearatorMb() {
                
                let $div = $('<div></div>')
                $tab.parent().css('overflow', 'scroll').css({
                    display: 'flex',
                    'justify-content': 'center',
                    'align-items': 'center'
                })

                let $divWrap = $($tab.parent()[0])
                $tab = $($tab[0])
                $tab.css({
                    width: 'max-content',
                    height: 'max-content',
                    position: 'relative'
                })
                $divWrap.append($div)
                $div.append($tab)

                let scale = 1

                function rsWrapProps() {
                    let newHeight = $tab.outerHeight()*scale
                    let newWidth = $tab.outerWidth()*scale
                    $div.css('height', newHeight + 'px')
                    $div.css('width', newWidth + 'px')

                    $divWrap.css('align-items', (newHeight < $divWrap.outerHeight()) ? 'center' : 'unset')
                    $divWrap.css('justify-content', (newWidth < $divWrap.outerWidth()) ? 'center' : 'unset')
                    $divWrap.css('border-top', `${$('#header').outerHeight()}px solid transparent`)
                }

                let _move = (targetOffset, realOffset, speed, end) => {
                    let tabOffset = $tab.offset()

                    let tgScrLeft = realOffset.left - tabOffset.left - targetOffset.left
                    let tgScrTop = realOffset.top - tabOffset.top - targetOffset.top + props.vDis/2

                    if (speed <= 0) {
                        $divWrap.scrollLeft(tgScrLeft)
                        $divWrap.scrollTop(tgScrTop)
                        if (end) end()
                        return
                    }

                    let rScrLeft = $divWrap.scrollLeft()
                    let rScrTop = $divWrap.scrollTop()
                    let distance = Math.sqrt((rScrLeft - tgScrLeft)**2 + (rScrTop - tgScrTop)**2)
                    let duration = distance/(scale >= 1 ? scale : Math.sqrt(scale))/speed
                    if (duration < 200) {
                        duration = 800*Math.pow(duration/800, 1/6)
                    } else if (duration < 800) {
                        duration = 800*Math.pow(duration/800, 1/16)
                    }

                    $divWrap.animate({
                        scrollLeft: `${tgScrLeft}px`,
                        scrollTop: `${tgScrTop}px`
                    }, duration, () => {
                        if (end) end()
                    })

                    return
                }

                let moveToCard = ($card, speed = 0, end) => {
                    if (!$card) return

                    let height = $card.outerHeight()*scale
                    let width = $card.outerWidth()*scale
                    let documentHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
                    let documentWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
                    let mainPaddLeft = parseInt($('#main').css('padding-left').replace('px', ''))
                    if (isNaN(mainPaddLeft)) mainPaddLeft = isMobile ? 0 : 256
                    
                    let targetOffset = {
                        top: $('#header').outerHeight() + (documentHeight - $('#header').outerHeight())/2 - height/2,
                        left: mainPaddLeft + (documentWidth - mainPaddLeft)/2 - width/2
                    }
                    let realOffset = $card.offset()
                    
                    _move(targetOffset, realOffset, speed, end)
                }

                let isClickEvent = () => true

                let getZoom = () => scale

                let setZoom = z => {
                    let tabOffset = $tab.offset()
                    let documentHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
                    let documentWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
                    let mainPaddLeft = parseInt($('#main').css('padding-left').replace('px', ''))
                    if (isNaN(mainPaddLeft)) mainPaddLeft = isMobile ? 0 : 256
                    let scrMid = {
                        top: $('#header').outerHeight() + (documentHeight - $('#header').outerHeight())/2,
                        left: mainPaddLeft + (documentWidth - mainPaddLeft)/2
                    }

                    let $markedPoint = $('<div></div>').css({
                        height: '10px',
                        width: '10px',
                        position: 'absolute',
                        top: `${Math.abs(tabOffset.top/scale) + scrMid.top/scale - 5}px`,
                        left: `${Math.abs(tabOffset.left/scale) + scrMid.left/scale - 5}px`,
                        opacity: 0
                        
                    })

                    $tab.append($markedPoint)

                    scale = z
                    $tab.css('transform', `scale(${scale})`)
                    rsWrapProps()

                    moveToCard($markedPoint)
                    $markedPoint.remove()
                }

                return [moveToCard, isClickEvent, setZoom, getZoom]
            }
            let [moveToCard, isClickEvent, setZoom, getZoom] = (isMobile ? zAccGenearatorMb : zAccGenearatorPC)()

            if (bakAncestor) {
                drawTree({
                    ancestor: bakAncestor,
                    targetPersonId: config.targetPersonId
                })
            } else {
                let level = 1
                if (config.targetPeople.showWifes) level = 2
                else if (config.targetPeople.hasRelMainBranch) level = 3
                api.drawFTree({targetPersonId: config.targetPersonId, level}).then(drawTree)
            }

            function drawTree({ancestor, targetPersonId}) {
                config.targetPersonId = targetPersonId
                bakAncestor = null
                let $tree = genFGroup(ancestor)
                $tree.css({
                    position: 'fixed',
                    top: '200%',
                    'padding-bottom': props.vDis + 'px'
                })
                $tab.append($tree)

                let prevScale = 1
                let drLineInter = setInterval(() => {
                    if ($tree.height() != 0) {
                        clearInterval(drLineInter)
                        
                        drwLineCbs.forEach(f => f())
                        $tree.css({
                            position: 'unset',
                            top: 'unset'
                        })
                        if (lastViewStatus.scale) {
                            let bound = 0.5
                            if (lastViewStatus.scale > bound) {
                                prevScale = Math.max(lastViewStatus.scale/1.5, bound)
                            } else {
                                prevScale = lastViewStatus.scale
                            }
                            setZoom(prevScale)
                        } else {
                            if (isMobile) {
                                prevScale = 0.5
                                setZoom(0.5) 
                            }
                        }
                        moveToCard($fPCard || $tgPerCard)
                    }
                }, 1)

                function genOpHtml(type) {
                    return `<div style="height: 3rem; width: 3rem; padding: 0.6rem; margin-left: 0.5rem; border-radius: 0.5rem; background-color: white; border: 1px solid rgba(0, 0, 21, 0.175); cursor: pointer;">
                        <svg class="nav-icon" style="width: 100%; height: 100%;">
                            <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-${type}"></use>
                        </svg>
                    </div>`
                }

                $tab.parent().append(
                    $('<div style="position: fixed; bottom: 1rem; right: 1rem; display: flex;"></div>').append(
                        isMobile ? $(genOpHtml('zoom-out')).click(() => {
                            prevScale = Math.max(0.01, prevScale/1.2)
                            setZoom(prevScale)
                        }) : null,
                        isMobile ? $(genOpHtml('zoom-in')).click(() => {
                            prevScale = Math.min(3, prevScale*1.2)
                            setZoom(prevScale)
                        }) : null,
                        $(genOpHtml('location-pin')).click(function () {
                            if ($(this).attr('disabled')) return
                            $(this).attr('disabled', true)
                            moveToCard($tgPerCard, 20, () => {
                                $(this).attr('disabled', false)
                            })
                        }),
                        $(genOpHtml('data-transfer-down')).click(() => {
                            domtoimage.toPng($tree[0], { bgcolor: 'rgb(235, 237, 239)' }).then((dataUrl) => {
                                let link = document.createElement('a')
                                link.href = dataUrl
                                let t = new Date()
                                link.download = `BĐGP_${t.getDate()}-${t.getMonth() + 1}-${t.getFullYear()}`
                                link.click()
                            })
                        }),
                        $(genOpHtml('settings')).click(() => {
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
                                    <input class="form-check-input" type="checkbox" value="" id="show-bday" ${config.show.birthday ? 'checked' : ''}>
                                    <label class="form-check-label" for="show-bday">
                                        Ngày sinh
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="show-dday" ${config.show.deathday ? 'checked' : ''}>
                                    <label class="form-check-label" for="show-dday">
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
                                    <option value="hasRelMainBranch" ${config.targetPeople.hasRelMainBranch ? 'selected' : ''}>Mức 3: Vẽ bất cứ ai có quan hệ (vẽ cả chồng và con cái của các nữ trong dòng họ)</option>
                                </select>

                                <label class="form-label" style="margin-top: 1.5rem;">Khoảng cách theo chiều ngang</label>
                                <select class="form-select" name="hDis"></select>

                                <label class="form-label" style="margin-top: 1.5rem;">Khoảng cách theo chiều dọc</label>
                                <select class="form-select" name="vDis"></select>
                            `
                            let [$getPInp, _, getPersonId, __] = gen$fInput({
                                type: 'PERSON',
                                name: 'Chủ thể biểu đồ gia phả',
                                isMultiValue: false,
                                value: targetPersonId,
                                code: 'Some values to make sure can not be changed'
                            })
                            bigPopUp(html, {
                                script: $popUp => {
                                    $popUp.find('.content').prepend($getPInp)

                                    let $selectHDis = $popUp.find('.content select[name="hDis"]')
                                    for (let i = 1; i <= 8; i++) {
                                        $selectHDis.append(`<option value="${i*20}" ${config.props.hDis == (i*20) ? 'selected' : ''}>${i*20} px</option>`)
                                    }

                                    let $selectVDis = $popUp.find('.content select[name="vDis"]')
                                    for (let i = 1; i <= 8; i++) {
                                        $selectVDis.append(`<option value="${i*20}" ${config.props.vDis == (i*20) ? 'selected' : ''}>${i*20} px</option>`)
                                    }
                                },
                                hideClBtn: true,
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
                                            config.show.birthday = $popUp.find('input#show-bday')[0].checked
                                            config.show.deathday = $popUp.find('input#show-dday')[0].checked

                                            config.layout.default = $popUp.find('input#layout-default')[0].checked
                                            config.layout.minWidth = $popUp.find('input#layout-minWidth')[0].checked
                                            if (config.layout.default && config.layout.minWidth) config.layout.minWidth = false

                                            let targetPeople = $popUp.find('select[name="targetPeople"]').val()
                                            let oldTgP = Object.keys(config.targetPeople).find(key => config.targetPeople[key])
                                            let tgPPValid = false
                                            for (let key in config.targetPeople) {
                                                if (key == targetPeople) {
                                                    tgPPValid = true
                                                    config.targetPeople[key] = true
                                                } else {
                                                    config.targetPeople[key] = false
                                                }
                                            }
                                            if (!tgPPValid) config.targetPeople.default = true
                                            let nTgP = Object.keys(config.targetPeople).find(key => config.targetPeople[key])

                                            let hDis = Number($popUp.find('select[name="hDis"]').val())
                                            if (isNaN(hDis) || Math.round(hDis) != hDis
                                                || hDis < 20 || hDis > 160
                                                || hDis%20 != 0) {
                                                    hDis = 80
                                            }
                                            config.props.hDis = hDis

                                            let vDis = Number($popUp.find('select[name="vDis"]').val())
                                            if (isNaN(vDis) || Math.round(vDis) != vDis
                                                || vDis < 20 || vDis > 160
                                                || vDis%20 != 0) {
                                                    vDis = 80
                                            }
                                            config.props.vDis = vDis

                                            let tgPIdFromInp = getPersonId().value
                                            if (!tgPIdFromInp || tgPIdFromInp == '') {
                                                tgPIdFromInp = targetPersonId
                                            }

                                            $('#t-fmTree').html('')
                                            if (tgPIdFromInp != targetPersonId || oldTgP != nTgP) {
                                                config.targetPersonId = tgPIdFromInp
                                                lastViewStatus.fcPerId = null
                                                createTree()
                                            } else {
                                                bakAncestor = ancestor
                                                lastViewStatus.fcPerId = null
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

    function tabStatistic() {
        let $tab = $('#t-stas')

        api.statistic().then(({numMales, numFemales, ages}) => {
            ages = ages.map(a => (a || a === 0) ? a : -1)
            function genCardHtml(header, value, icon, bgColor) {
                return `<div class="card">
                    <div class="card-body p-3 d-flex align-items-center">
                        <div class="bg-primary text-white p-3 me-3" style="${bgColor ? `background-color: ${bgColor} !important;`: ''}">
                            <svg class="icon icon-xl">
                            <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-${icon}"></use>
                            </svg>
                        </div>
                        <div>
                            <div class="fs-6 fw-semibold text-primary">${value}</div>
                            <div class="text-medium-emphasis text-uppercase fw-semibold small">${header}</div>
                        </div>
                    </div>
                </div>`
            }
            
            $tab.append(`<div class="row">
                <div class="col-sm-6">${genCardHtml('Số lượng Nam', numMales, 'user')}</div>
                <div class="col-sm-6">${genCardHtml('Số lượng Nữ', numFemales, 'user-female', '#ff3e80')}</div>
            </div>
            <div class="card" style="margin-top: 1.5rem;">
                <div style="height: 1px;"></div>
                <canvas id="age-chart" style="padding: 1rem;"></canvas>
            </div>`);

            
            (() => {
                let countUAge = ages.reduce((prev, age) => prev + (age == -1 ? 1 : 0), 0)
                let countZeroAge = ages.reduce((prev, age) => prev + (age == 0 ? 1 : 0), 0)
                ages = ages.filter(age => age > 0)
                let maxAges = Math.max(...ages)
                let maxNumRange = 20
                let minNumRange = 8
                let mLenRange = 5
                let rangeLength = maxAges/maxNumRange
                rangeLength = Math.ceil(rangeLength/5)*5
                rangeLength = Math.max(rangeLength, mLenRange)

                let rangeLabels = ['Không rõ', 0]
                let rangeCounts = [countUAge, countZeroAge]
                ages.sort((a, b) => a - b)
                let lastRangeEnd = 0
                for (let i = 0; i < ages.length; i++) {
                    let age = ages[i]
                    while (age > lastRangeEnd) {
                        rangeLabels.push(`${lastRangeEnd + 1} - ${lastRangeEnd + rangeLength}`)
                        rangeCounts.push(0)
                        lastRangeEnd = lastRangeEnd + rangeLength
                    }
                    rangeCounts[rangeCounts.length - 1]++
                }

                while (rangeLabels.length < minNumRange) {
                    rangeLabels.push(`${lastRangeEnd + 1} - ${lastRangeEnd + rangeLength}`)
                    rangeCounts.push(0)
                    lastRangeEnd = lastRangeEnd + rangeLength
                }

                let data = {
                    labels: rangeLabels,
                    datasets: [{
                        label: 'Số người có độ tuổi trong khoảng này',
                        data: rangeCounts,
                        backgroundColor: 'rgba(70, 192, 192, 0.6)',
                        borderColor: 'rgba(150, 100, 255, 1)',
                        borderWidth: 1
                    }]
                }
                let options = {
                    scales: {
                        y: {
                            beginAtZero: true
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Số tuổi'
                            }
                        }
                    }
                }
                new Chart($('#age-chart')[0], {
                    type: 'bar',
                    data: data,
                    options: options
                })
            })()
        })
    }

    function tUCmEvts() {
        let $tab = $('#t-uCm-Evts').html('')

        api.getBsInfTgPeopleUCmEvts().then(personInfos => {
            let events = []
            let now = new Date()
            let dnow = now.getDate(), mnow = now.getMonth() + 1, ynow = now.getFullYear()
            let [ldnow, lmnow, lynow] = DateLib.dateToLDate(`${dnow}/${mnow}/${ynow}`).split('/').map(i => Number(i))
            let nowDate = new Date(ynow, mnow - 1, dnow)
            let score = {}
            function dateTransfer(date, isLunarDate = false) {
                if (isLunarDate) {
                    if (!DateLib.isValidLDate(date)) return null
                    let [ld, lm, ly] = date.split('/').map(i => Number(i))
                    if (lm < lmnow || (lm == lmnow && ld < ldnow)) ly = lynow + 1
                    else ly = lynow
                    date = `${ld}/${lm}/${ly}`
                    date = DateLib.lDateToDate(date)
                    let [d, m, y] = date.split('/').map(i => Number(i))
                    score[date] = y*4000 + m*20 + d
                    return date
                } else {
                    if (!DateLib.isValidDate(date)) return null
                    let [d, m, y] = date.split('/').map(i => Number(i))
                    if (m < mnow || (m == mnow && d < dnow)) y = ynow + 1
                    else y = ynow
                    date = `${d}/${m}/${y}`
                    score[date] = y*4000 + m*20 + d
                    return date
                }
            }
            function deltaDaysNow(date) {
                let [d, m, y] = date.split('/').map(i => Number(i))
                return Math.round((new Date(y, m - 1, d).getTime() - nowDate.getTime())/(1000*60*60*24))
            }
            personInfos.forEach(person => {
                if (person.birthday && person.birthday != '' && (!person.deathday || person.deathday == '')) {
                    let deltaDay = deltaDaysNow(person.birthday)
                    dateTransfer(person.birthday) 

                    if (deltaDay == 0) {
                        events.push({
                            type: 'ngaysinh',
                            originalDate: person.birthday,
                            date: person.birthday,
                            person
                        })
                    }
                    
                    if (deltaDay < 0) {
                        events.push({
                            type: 'sinhnhat',
                            originalDate: person.birthday,
                            date: dateTransfer(person.birthday, false),
                            person
                        })
                    }
                }
                if (person.deathday && person.deathday != '') {
                    let deltaDay = deltaDaysNow(DateLib.lDateToDate(person.deathday))
                    dateTransfer(person.deathday) 

                    if (deltaDay == 0) {
                        events.push({
                            type: 'ngaymat',
                            originalDate: person.deathday,
                            date: DateLib.lDateToDate(person.deathday),
                            person
                        })
                    }

                    if (deltaDay < 0) {
                        events.push({
                            type: 'ngaygio',
                            originalDate: person.deathday,
                            date: dateTransfer(person.deathday, true),
                            person
                        })
                    }
                }
            })
            events.sort((e1, e2) => score[e1.date] - score[e2.date])

            let lastDate = null
            events.forEach(({type, originalDate, date, person}) => {
                if (date != lastDate) {
                    let dDays = deltaDaysNow(date)
                    let dDaysStr = ''
                    if (dDays == 0) dDaysStr = 'Hôm nay'
                    else if (dDays == 1) dDaysStr = 'Ngày mai'
                    else if (dDays == 2) dDaysStr = 'Ngày kia'
                    else dDaysStr = dDays + ' ngày nữa'
                    $tab.append(`<h2 style="margin-bottom: 1rem; margin-top: ${!lastDate ? '2rem' : '2rem'};">Ngày ${date} ~ ${DateLib.dateToLDate(date)} âm lịch <span class="badge text-bg-secondary" style="transform: translateY(-0.1rem);">${dDaysStr}</span></h2>`)
                    lastDate = date
                }

                let typeString = 'Ngày gì đó'
                let evtStrSubfix = ''
                switch (type) {
                    case 'ngaysinh':
                        typeString = 'Ngày sinh'
                        evtStrSubfix = ''
                        break
                    case 'sinhnhat':
                        typeString = 'Sinh nhật'
                        evtStrSubfix = `(ngày sinh: ${originalDate})`
                        break
                    case 'ngaymat':
                        typeString = 'Ngày mất'
                        evtStrSubfix = ''
                        break
                    case 'ngaygio':
                        typeString = 'Ngày giỗ'
                        evtStrSubfix = `(ngày mất: ${originalDate} âm lịch)`
                        break
                }

                $tab.append(`<div style="display: flex; align-items: center; height: 4rem; background-color: white; margin-bottom: 1rem; border-radius: 0.4rem; padding: 0.5rem;">
                    <img class="my-img card-border" style="height: 100%; margin-right: 0.5rem;" src="${person.avatar || defAvtUrl}">
                    <div>
                        ${typeString} của <span class="fw-bolder">${person.callname}</span> ${evtStrSubfix}
                    </div>
                </div>`)
            })

            $tab.prepend(`<button type="button" class="btn btn-primary" style="margin-bottom: 12px;" id="edit-target">
                <svg class="icon">
                <use xlink:href="./resources/@coreui/icons/svg/free.svg#cil-settings"></use>
                </svg> Tùy chỉnh đối tượng
            </button>`)

            $tab.find('#edit-target').click(() => {
                let pIdsIfChoosed = []
                bigPopUp('', {
                    script: $popUp => {
                        api.getUpCmEvtTgInf().then(({type, numGenerationsAbove, numGenerationsBelow, includeEqualGeneration, specificPersonIds}) => {
                            let html = `
                                <h1>Cài đặt đối tượng cho các sự kiện sắp tới</h1>
                                <input class="form-check-input" type="radio" name="tg-opt" id="target-all" ${type == 0 ? 'checked' : ''}>
                                <label class="form-check-label" for="target-all">
                                    Tất cả mọi người
                                </label>
                                <br>
                                <input class="form-check-input" type="radio" name="tg-opt" id="tg-hCont" ${type > 1 ? 'checked' : ''}>
                                <label class="form-check-label" for="tg-hCont">
                                    Những người thỏa mãn điều kiện nào đó
                                </label>
                                <br>
                                <input class="form-check-input" type="radio" name="tg-opt" id="spec-target" ${type == 1 ? 'checked' : ''}>
                                <label class="form-check-label" for="spec-target">
                                    Chỉ định những người bạn mong muốn
                                </label>
                            `

                            $popUp.find('.content').append(html)
                            $popUp.find('#spec-target').before(`<div style="padding: 0.5rem 2rem;" id="tg-hCont-sp"><div style=" border: 2px solid; padding: 1rem; border-radius: 0.5rem;">
                                <label class="form-check-label" for="">
                                    Đối tượng
                                </label>
                                <select class="form-select" name="">
                                    <option value="2" ${type != 3 ? 'selected' : ''}>Những người thuộc biểu đồ gia phả mức 2</option>
                                    <option value="3" ${type == 3 ? 'selected' : ''}>Những người thuộc biểu đồ gia phả mức 3</option>
                                </select>

                                <div class="col-12">
                                    <label for="" class="form-label">Số đời phía trên tôi</label>
                                    <input type="text" class="form-control" id="tg-hCont-nGen-above" placeholder="Số nguyên không âm" value="${(type > 1) ? numGenerationsAbove : 3}">
                                    <div class="invalid-feedback" id="tg-hCont-nGen-above-fb"></div>
                                </div>

                                <div class="col-12">
                                    <label for="" class="form-label">Số đời phía dưới tôi</label>
                                    <input type="text" class="form-control" id="tg-hCont-num-gen-below" placeholder="Số nguyên không âm" value="${(type > 1) ? numGenerationsBelow : 3}">
                                    <div class="invalid-feedback" id="tg-hCont-nGen-below-fb"></div>
                                </div>

                                <input class="form-check-input" id="tg-hCont-icl-equal-gen" type="checkbox" ${(type > 1 && !includeEqualGeneration) ? '' : 'checked'}>
                                <label for="tg-hCont-icl-equal-gen" class="form-label">Đời ngang tôi</label>
                            </div></div>`)

                            if (type == 1) pIdsIfChoosed = specificPersonIds == '' ? [] : specificPersonIds.split(mulValDel)

                            $popUp.find('.content').append(`<div style="padding: 0.5rem 2rem;" id="spec-tg-sp"><div style=" border: 2px solid; padding: 1rem; border-radius: 0.5rem;">
                                <span class="count">${type == 1 ? pIdsIfChoosed.length : 0}</span> người đã người được chọn <button class="btn btn-primary">Thay đổi</button>
                            </div></div>`)

                            if (type == 0 || type == 1) $popUp.find('#tg-hCont-sp').hide()
                            if (type != 1) $popUp.find('#spec-tg-sp').hide()

                            $popUp.find('#target-all').click(() => {
                                $popUp.find('#tg-hCont-sp').hide()
                                $popUp.find('#spec-tg-sp').hide()
                            })
                            $popUp.find('#tg-hCont').click(() => {
                                $popUp.find('#tg-hCont-sp').show()
                                $popUp.find('#spec-tg-sp').hide()
                            })
                            $popUp.find('#spec-target').click(() => {
                                $popUp.find('#tg-hCont-sp').hide()
                                $popUp.find('#spec-tg-sp').show()
                            })

                            $popUp.find('#spec-tg-sp button').click(() => {
                                puPickP(people => {
                                    pIdsIfChoosed = people.map(({id}) => id)
                                    $popUp.find('#spec-tg-sp .count').html(pIdsIfChoosed.length)
                                }, {
                                    isMultiValue: true,
                                    pickedIds: pIdsIfChoosed
                                })
                            })
                        })
                    },
                    hideClBtn: true,
                    buttons: [{
                        html: 'Thoát',
                        click: $popUp => $popUp.remove()
                    }, {
                        html: 'Lưu lại',
                        type: 'success',
                        click: $popUp => {
                            let data
                            if ($popUp.find('#tg-hCont')[0].checked) {
                                let type = $popUp.find('#tg-hCont-sp select')[0].value != 3 ? '2' : '3'
                                let numGenerationsAbove = $popUp.find('#tg-hCont-nGen-above').val()
                                numGenerationsAbove = parseInt(numGenerationsAbove)
                                if (isNaN(numGenerationsAbove) || numGenerationsAbove < 0) {
                                    $popUp.find('#tg-hCont-nGen-above-fb').html('Phải nhập số nguyên không âm!').show()
                                    return
                                }
                                let numGenerationsBelow = $popUp.find('#tg-hCont-num-gen-below').val()
                                numGenerationsBelow = parseInt(numGenerationsBelow)
                                if (isNaN(numGenerationsBelow) || numGenerationsBelow < 0) {
                                    $popUp.find('#tg-hCont-nGen-below-fb').html('Phải nhập số nguyên không âm!').show()
                                    return
                                }
                                let includeEqualGeneration = $popUp.find('#tg-hCont-icl-equal-gen')[0].checked ? 1 : 0
                                data = {type, numGenerationsAbove, numGenerationsBelow, includeEqualGeneration, specificPersonIds: ''}
                            }
                            else if ($popUp.find('#spec-target')[0].checked) {
                                data = {type: 1, numGenerationsAbove: 0, numGenerationsBelow: 0, includeEqualGeneration: 0, specificPersonIds: pIdsIfChoosed.join(mulValDel)}
                            }
                            else {
                                data = {type: 0, numGenerationsAbove: 0, numGenerationsBelow: 0, includeEqualGeneration: 0, specificPersonIds: ''}
                            }
                            api.udUpcomingEvtTarInf({upcomingEventTargetInfo: data}).then(() => {
                                tUCmEvts()
                                $popUp.remove()
                            })
                        }
                    }]
                })
            })
        })
    }

    $('#t-people-mng')[0].load = tPPMng
    $('#t-fmTree')[0].load = tFTree
    $('#t-stas')[0].load = tabStatistic
    $('#t-uCm-Evts')[0].load = tUCmEvts
}
