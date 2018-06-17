import Vue from 'vue';
import VueFormGenerator from 'vue-form-generator';
import VueFormWizard from 'vue-form-wizard';
import { BaseException, TypeErrorException } from './lib/BaseExceptions';
import StringHelper from './lib/StringHelper';
import ObjectHelper from './lib/ObjectHelper';
import Utils from '../Utils';
import 'vue-form-wizard/dist/vue-form-wizard.min.css';

Vue.use( VueFormWizard );
Vue.use( VueFormGenerator );

class InvalidFieldException extends BaseException
{
	constructor( Message )
	{
		super( 'InvalidFieldException', Message );
	}
}

class InvalidFieldPropertyException extends BaseException
{
	constructor( Message )
	{
		super( 'InvalidFieldPropertyException', Message );
	}
}

class InvalidFieldValueException extends BaseException
{
	constructor( Message )
	{
		super( 'InvalidFieldValueException', Message );
	}
}

const ErrorMessages = {
	UNKNOWN_METHOD_OR_PROPERTY: 'Unknown method or property {} of field {} .',
	UNKNOWN_METHOD: 'Unknown method {} of field {} .',
	UNSUPPORTED_TYPE: 'Unsupported type {} in field {}{}. Expected {}.',
	UNKNOWN_FIELDTYPE: 'Unknown fieldtype {} of field {} .',
	NO_VALUES: 'The given field {} has no \'values\' property.',
	CANNOT_SWITCH_VALUES: 'Cannot switch from automatic field definition to manual at field {}.',
	NO_LABEL_INSIDE_BUTTON: 'A button property of field {} has no label.',
	NO_NAME: 'A given field has no name property',
	IVALID_TOP_ITEM: 'Invalid {} got {}, expected {}.'
};

const BlubberFormFactory = {
//    components: { FormWizard, TabContent },
	methods: {
		__lookForPropertyAtVueObject: function ( IsTypeOrFunction, Self )
		{
			let Index;
			const Chunks = IsTypeOrFunction.split( '.' );
			for ( Index in Chunks )
			{
				if ( Chunks[ Index ] in Self )
				{
					Self = Self[ Chunks[ Index ] ];
				}
				else
				{
					Self = null;
					break;
				}
			}
			return Self;
		},
		__genericExecuteFuncionOrGetSomething: function (
			IsTypeOrFunction,
			Type,
			FieldName,
			ReturnPureFunction = false
		)
		{
			let Self;
			if ( 'function' === typeof IsTypeOrFunction )
			{
				if ( true === ReturnPureFunction )
				{
					return IsTypeOrFunction;
				}

				IsTypeOrFunction = IsTypeOrFunction( FieldName );
			}
			else
			{
				Self = this;
				if ( 'string' === typeof IsTypeOrFunction )
				{
					if ( true === IsTypeOrFunction.includes( '.' ) )
					{
						Self = this.__lookForPropertyAtVueObject( IsTypeOrFunction, Self );
					}
					else if ( IsTypeOrFunction in Self && 'function' === typeof Self[ IsTypeOrFunction ] )
					{
						Self = this[ IsTypeOrFunction ];
					}
					else
					{
						Self = null;
					}

					if ( null !== Self )
					{
						if ( 'function' === typeof Self )
						{
							if ( true === ReturnPureFunction )
							{
								return Self;
							}
							IsTypeOrFunction = Self( FieldName );
						}
					}
					else
					{
						if ( true === ReturnPureFunction )
						{
							throw new InvalidFieldPropertyException(
								StringHelper.format(
									ErrorMessages.UNKNOWN_METHOD,
									IsTypeOrFunction,
									FieldName
								)
							);

						}
					}
				}
			}

			if ( typeof IsTypeOrFunction === Type || 'any' === Type )
			{
				return IsTypeOrFunction;
			}
			throw new InvalidFieldException(
				StringHelper.format(
					ErrorMessages.UNSUPPORTED_TYPE,
					typeof IsTypeOrFunction,
					FieldName,
					'',
					Type
				)
			);
		},
		__executeFunctionOrGetString: function (
			IsTypeOrFunction,
			FieldName,
			ReturnPureFunction = false
		)
		{
			return this.__genericExecuteFuncionOrGetSomething(
				IsTypeOrFunction,
				'string',
				FieldName,
				ReturnPureFunction
			);
		},
		__executeFunctionOrGetNumber: function (
			IsTypeOrFunction,
			FieldName,
			ReturnPureFunction = false
		)
		{
			return this.__genericExecuteFuncionOrGetSomething(
				IsTypeOrFunction,
				'number',
				FieldName,
				ReturnPureFunction
			);
		},
		__executeFunctionOrGetBool: function (
			IsTypeOrFunction,
			FieldName,
			ReturnPureFunction = false
		)
		{
			return this.__genericExecuteFuncionOrGetSomething(
				IsTypeOrFunction,
				'boolean',
				FieldName,
				ReturnPureFunction
			);
		},
		__executeFunctionOrGetObject: function (
			IsTypeOrFunction,
			FieldName,
			ReturnPureFunction = false
		)
		{
			return this.__genericExecuteFuncionOrGetSomething(
				IsTypeOrFunction,
				'object',
				FieldName,
				ReturnPureFunction
			);
		},
		__executeFunctionOrGetArray: function (
			IsTypeOrFunction,
			FieldName,
			ReturnPureFunction = false
		)
		{
			let Self;
			if ( 'function' === typeof IsTypeOrFunction )
			{
				if ( true === ReturnPureFunction )
				{
					return IsTypeOrFunction;
				}

				IsTypeOrFunction = IsTypeOrFunction( FieldName );
			}
			else
			{
				Self = this;
				if ( 'string' === typeof IsTypeOrFunction )
				{
					if ( true === IsTypeOrFunction.includes( '.' ) )
					{
						Self = this.__lookForPropertyAtVueObject( IsTypeOrFunction, Self );
					}
					else if ( IsTypeOrFunction in Self && 'function' === typeof Self[ IsTypeOrFunction ] )
					{
						Self = this[ IsTypeOrFunction ];
					}

					if ( null !== Self )
					{
						if ( 'function' === typeof Self )
						{
							if ( true === ReturnPureFunction )
							{
								return Self;
							}

							IsTypeOrFunction = Self( FieldName );
						}
					}
					else
					{
						throw new InvalidFieldException(
							StringHelper.format(
								ErrorMessages.UNKNOWN_METHOD_OR_PROPERTY,
								IsTypeOrFunction,
								FieldName
							)
						);

					}
				}
			}

			if ( true === Array.isArray( IsTypeOrFunction ) )
			{
				return IsTypeOrFunction;
			}

			throw new InvalidFieldException(
				StringHelper.format(
					ErrorMessages.UNSUPPORTED_TYPE,
					typeof IsTypeOrFunction,
					FieldName,
					'',
					'array'
				)
			);

		},
		__getStringLabelOrEmpty: function ( LabelGenerator, Label )
		{
			let LabelValue;

			if ( true === Utils.isEmpty( Label ) )
			{
				return '';
			}
			else
			{
				LabelValue = LabelGenerator( Label );
				if ( true === Utils.isEmpty( LabelValue ) || Label === LabelValue )
				{
					return '';
				}
				return Label;
			}
		},
		__getStringLabelOrPlaceholder: function ( LabelGenerator, Label )
		{
			let LabelValue;

			if ( true === Utils.isEmpty( Label ) )
			{
				return '';
			}
			else
			{
				LabelValue = LabelGenerator( Label );
				if ( true === Utils.isEmpty( LabelValue ) )
				{
					return Label;
				}
				else
				{
					return LabelValue;
				}
			}
		},
		__assignOptionalFieldString: function ( Field, GeneratedField, FieldLabel, AssignmentLabel = '' )
		{
			if ( FieldLabel in Field )
			{
				if ( false === StringHelper.isEmpty( AssignmentLabel ) )
				{
					GeneratedField[ AssignmentLabel ] = this.__executeFunctionOrGetString(
						Field[ FieldLabel ],
						Field.name
					);
				}
				else
				{
					GeneratedField[ FieldLabel ] = this.__executeFunctionOrGetString(
						Field[ FieldLabel ],
						Field.name
					);
				}
			}
		},
		__assignOptionalFieldNumeric: function ( Field, GeneratedField, FieldLabel, AssignmentLabel = '' )
		{
			if ( FieldLabel in Field )
			{
				if ( false === StringHelper.isEmpty( AssignmentLabel ) )
				{
					GeneratedField[ AssignmentLabel ] = this.__executeFunctionOrGetNumber(
						Field[ FieldLabel ],
						Field.name
					);
				}
				else
				{
					GeneratedField[ FieldLabel ] = this.__executeFunctionOrGetNumber(
						Field[ FieldLabel ],
						Field.name
					);
				}
			}
		},
		__assignOptionalFieldBoolean: function ( Field, GeneratedField, FieldLabel, AssignmentLabel = '' )
		{
			if ( FieldLabel in Field )
			{
				if ( false === StringHelper.isEmpty( AssignmentLabel ) )
				{
					GeneratedField[ AssignmentLabel ] = this.__executeFunctionOrGetBool(
						Field[ FieldLabel ],
						Field.name
					);
				}
				else
				{
					GeneratedField[ FieldLabel ] = this.__executeFunctionOrGetBool(
						Field[ FieldLabel ],
						Field.name
					);
				}
			}
		},
		__assignOptionalFieldObject: function ( Field, GeneratedField, FieldLabel, AssignmentLabel = '' )
		{
			if ( FieldLabel in Field )
			{
				if ( false === StringHelper.isEmpty( AssignmentLabel ) )
				{
					GeneratedField[ AssignmentLabel ] = this.__executeFunctionOrGetObject(
						Field[ FieldLabel ],
						Field.name
					);
				}
				else
				{
					GeneratedField[ FieldLabel ] = this.__executeFunctionOrGetObject(
						Field[ FieldLabel ],
						Field.name
					);
				}
			}
		},
		__assignOptionalFieldFunction: function ( Field, GeneratedField, FieldLabel, AssignmentLabel = '' )
		{
			let Mutable;
			if ( FieldLabel in Field )
			{
				Mutable = this.__executeFunctionOrGetString(
					Field[ FieldLabel ],
					Field.name, true
				);
				if ( 'function' !== typeof Mutable )
				{
					throw new InvalidFieldException(
						StringHelper.format(
							ErrorMessages.UNSUPPORTED_TYPE,
							typeof Mutable,
							Field.name,
							'',
							'function'
						)
					);
				}

				if ( false === StringHelper.isEmpty( AssignmentLabel ) )
				{
					GeneratedField[ AssignmentLabel ] = Mutable;
				}
				else
				{
					GeneratedField[ FieldLabel ] = Mutable;
				}
			}
		},
		__assignOptionalEmptyStringOrLabelString: function ( LabelGenerator, Field, GeneratedField, FieldLabel, AssignmentLabel = '' )
		{
			if ( FieldLabel in Field )
			{
				if ( false === StringHelper.isEmpty( AssignmentLabel ) )
				{
					GeneratedField[ AssignmentLabel ] = this.__getStringLabelOrEmpty(
						LabelGenerator,
						Field[ FieldLabel ]
					);
				}
				else
				{
					GeneratedField[ FieldLabel ] = this.__getStringLabelOrEmpty(
						LabelGenerator,
						Field[ FieldLabel ]
					);
				}
			}
		},
		__assignOptionalPlaceholderOrLabelString: function ( LabelGenerator, Field, GeneratedField, FieldLabel, AssignmentLabel = '' )
		{
			if ( FieldLabel in Field )
			{
				if ( false === StringHelper.isEmpty( AssignmentLabel ) )
				{
					GeneratedField[ AssignmentLabel ] = this.__getStringLabelOrPlaceholder(
						LabelGenerator,
						Field[ FieldLabel ]
					);
				}
				else
				{
					GeneratedField[ FieldLabel ] = this.__getStringLabelOrPlaceholder(
						LabelGenerator,
						Field[ FieldLabel ]
					);
				}
			}
		},
		__addAutocompleteProperty: function ( Field, GeneratedField )
		{
			if ( 'autocomplete' in Field && false === Field.autocomplete )
			{
				GeneratedField.autocomplete = 'off';
			}
			else
			{
				GeneratedField.autocomplete = 'on';
			}
		},
		__addTextBasedAttributes: function ( Field, GeneratedField, LabelGenerator )
		{
			this.__assignOptionalFieldBoolean( Field, GeneratedField, 'readonly' );
			this.__addAutocompleteProperty( Field, GeneratedField );
			this.__assignOptionalFieldNumeric( Field, GeneratedField, 'maximum', 'maxlength' );
			this.__assignOptionalFieldString( Field, GeneratedField, 'pattern' );
			this.__assignOptionalEmptyStringOrLabelString(
				LabelGenerator,
				Field,
				GeneratedField,
				'briefDescription',
				'placeholder'
			);
			this.__assignOptionalFieldNumeric( Field, GeneratedField, 'size' );
		},
		__addNumericBasedAttributes: function ( Field, GeneratedField )
		{
			this.__addAutocompleteProperty( Field, GeneratedField );
			this.__assignOptionalFieldString( Field, GeneratedField, 'getValuesFromList', 'list' );
			this.__assignOptionalFieldNumeric( Field, GeneratedField, 'maximum', 'max' );
			this.__assignOptionalFieldNumeric( Field, GeneratedField, 'minimum', 'min' );
			this.__assignOptionalFieldNumeric( Field, GeneratedField, 'stepSize' );
		},
		_buildInputField: function ( Field, GeneratedField, LabelGenerator )
		{
			GeneratedField.type = 'input';
			GeneratedField.inputType = Field.type;
			if (
				'text' === Field.type ||
                'search' === Field.type ||
                'url' === Field.type ||
                'tel' === Field.type ||
                'email' === Field.type
			)
			{
				this.__addTextBasedAttributes( Field, GeneratedField );

				if ( 'text' === Field.type || 'search' === Field.type )
				{
					this.__assignOptionalFieldString( Field, GeneratedField, 'dir' );
				}

				this.__assignOptionalFieldString( Field, GeneratedField, 'getValuesFromList', 'list' );

				if ( 'email' === Field.type )
				{
					this.__assignOptionalFieldBoolean( Field, GeneratedField, 'multipleInput', 'multiple' );
					if ( 'multiple' in GeneratedField )
					{
						GeneratedField.multi = GeneratedField.multiple;
					}
				}
			}
			else if ( 'password' === Field.type )
			{
				this.__addTextBasedAttributes( Field, GeneratedField, Field.name );
			}
			else if ( 'file' === Field.type )
			{
				this.__assignOptionalFieldString( Field, GeneratedField, 'accept' );
				this.__assignOptionalFieldBoolean( Field, GeneratedField, 'multipleInput', 'multiple' );
				if ( 'multiple' in GeneratedField )
				{
					GeneratedField.multi = GeneratedField.multiple;
				}
			}
			else if (
				'range' === Field.type ||
                'month' === Field.type ||
                'time' === Field.type ||
                'week' === Field.type ||
                'date' === Field.type ||
                'datetime-local' === Field.type
			)
			{
				GeneratedField =
                    this.__addNumericBasedAttributes( Field, GeneratedField, Field.name );
				if ( 'range' !== Field.type )
				{
					this.__assignOptionalFieldBoolean( Field, GeneratedField, 'readonly' );
				}

			}
			else if ( 'number' === Field.type )
			{
				this.__addNumericBasedAttributes( Field, GeneratedField, Field.name );
				this.__assignOptionalFieldBoolean( Field, GeneratedField, 'readonly' );
				this.__assignOptionalEmptyStringOrLabelString( LabelGenerator, Field, GeneratedField, 'briefDescription', 'placeholder' );
			}
			else if ( 'color' === Field.type )
			{
				this.__addAutocompleteProperty( Field, GeneratedField );
				this.__assignOptionalFieldString( Field, GeneratedField, 'getValuesFromList', 'list' );
			}
			else if ( 'reset' !== Field.type && 'hidden' !== Field.type )
			{
				throw new InvalidFieldException(
					StringHelper.format(
						ErrorMessages.UNKNOWN_FIELDTYPE,
						Field.type,
						Field.name
					)
				);

			}

			return GeneratedField;
		},
		__addValueProperty: function ( Field, LabelKey, ValueKey, LabelGenerator )
		{
			let Mutable, GeneratedValue, ValueIndex, ValueIsString;
			const GeneratedValues = [];
			if ( 'values' in Field )
			{
				Mutable = this.__executeFunctionOrGetArray( Field.values, Field.name );
			}
			else
			{
				throw new InvalidFieldException(
					StringHelper.format(
						ErrorMessages.NO_VALUES,
						Field.name
					)
				);
			}

			if ( false === Array.isArray( Mutable ) )
			{
				return Mutable;
			}

			if ( 'string' === typeof Mutable[ 0 ] )
			{
				ValueIsString = true;
			}
			else
			{
				ValueIsString = false;
			}

			for ( ValueIndex in Mutable )
			{
				if ( 'string' === typeof Mutable[ ValueIndex ] )
				{
					if ( true === ValueIsString )
					{
						GeneratedValues.push( Mutable[ ValueIndex ] );
					}
					else
					{
						throw new InvalidFieldValueException(
							StringHelper.format(
								ErrorMessages.CANNOT_SWITCH_VALUES.format,
								Field.name
							)
						);

					}
				}
				else if ( 'object' === typeof Mutable[ ValueIndex ] )
				{
					if ( false !== ValueIsString )
					{
						throw new InvalidFieldValueException(
							StringHelper.format(
								ErrorMessages.CANNOT_SWITCH_VALUES,
								Field.name
							)
						);

					}
					GeneratedValue = {};
					GeneratedValue[ ValueKey ] = Mutable[ ValueIndex ][ ValueKey ];
					this.__assignOptionalPlaceholderOrLabelString(
						LabelGenerator,
						Mutable[ ValueIndex ],
						GeneratedValue,
						LabelKey
					);
					GeneratedValues.push( GeneratedValue );
				}
				else
				{
					throw new InvalidFieldValueException(
						StringHelper.format(
							ErrorMessages.UNSUPPORTED_TYPE,
							typeof Mutable[ ValueIndex ],
							Field.name,
							'at values',
							'object or string'
						)
					);
				}
			}

			return GeneratedValues;
		},
		__addOptionProperty: function ( Field )
		{
			const GeneratedProperty = {};
			this.__assignOptionalFieldObject( Field, GeneratedProperty, 'options' );

			if ( false === ( 'value' in GeneratedProperty ) )
			{
				GeneratedProperty.value = 'value';
			}

			if ( false === ( 'name' in GeneratedProperty ) )
			{
				GeneratedProperty.name = 'label';
			}

			return GeneratedProperty;
		},
		_singleButton: function ( InsideButton, FieldName, LabelGenerator )
		{
			let Mutable;
			const GeneratedButton = {};
			InsideButton.name = FieldName;

			this.__assignOptionalFieldString(
				InsideButton,
				GeneratedButton,
				'class',
				'classes'
			);

			if ( 'label' in InsideButton )
			{
				Mutable = this.__executeFunctionOrGetString( InsideButton.label, FieldName );
				GeneratedButton.label = this.__getStringLabelOrPlaceholder(
					LabelGenerator,
					Mutable
				);
			}
			else
			{
				throw new InvalidFieldException(
					StringHelper.format(
						ErrorMessages.NO_LABEL_INSIDE_BUTTON,
						FieldName
					)
				);
			}
			this.__assignOptionalFieldFunction( InsideButton, GeneratedButton, 'action', 'onclick' );
			return GeneratedButton;
		},
		__addButtons: function ( Buttons, FieldName, LabelGenerator )
		{
			let Index, GeneratedButton;
			const Return = [];
			const InsideButtons = this.__genericExecuteFuncionOrGetSomething( Buttons, 'any', FieldName );

			if ( 'object' === typeof InsideButtons )
			{
				return [ this._singleButton( InsideButtons, FieldName, LabelGenerator ) ];
			}
			else if ( true === Array.isArray( InsideButtons ) )
			{
				for ( Index in InsideButtons )
				{
					GeneratedButton = {};
					if ( 'object' === typeof InsideButtons[ Index ] )
					{
						GeneratedButton = this._singleButton(
							InsideButtons,
							FieldName,
							LabelGenerator
						);
						Return.push( GeneratedButton );
					}
					else
					{
						throw new InvalidFieldException(
							StringHelper.format(
								ErrorMessages.UNSUPPORTED_TYPE,
								typeof InsideButtons[ Index ],
								FieldName,
								'at insideButtons',
								'array of objects or object'
							)
						);
					}
				}
				return Return;
			}
			else
			{
				throw new InvalidFieldException(
					StringHelper.format(
						ErrorMessages.UNSUPPORTED_TYPE,
						typeof InsideButtons,
						FieldName,
						'at insideButtons',
						'array of objects or object'
					)
				);

			}
		},
		_buildChoice: function ( Field, GeneratedField, LabelGenerator )
		{
			GeneratedField.type = 'radios';
			GeneratedField.radiosOptions = this.__addOptionProperty( Field );
			GeneratedField.values = this.__addValueProperty(
				Field,
				GeneratedField.radiosOptions.name,
				GeneratedField.radiosOptions.value,
				LabelGenerator
			);
		},
		_buildSelect: function ( Field, GeneratedField, LabelGenerator )
		{
			GeneratedField.type = 'select';
			GeneratedField.selectOptions = this.__addOptionProperty( Field );

			if ( 'noneSelectedText' in GeneratedField.selectOptions )
			{
				GeneratedField.selectOptions.noneSelectedText = this.__getStringLabelOrPlaceholder(
					LabelGenerator,
					GeneratedField.selectOptions.noneSelectedText
				);

				if ( false === ( 'hideNoneSelectedText' in GeneratedField.selectOptions ) )
				{
					GeneratedField.selectOptions.hideNoneSelectedText = false;
				}
			}
			else
			{
				if ( false === ( 'hideNoneSelectedText' in GeneratedField.selectOptions ) )
				{
					GeneratedField.selectOptions.hideNoneSelectedText = true;
				}
			}

			GeneratedField.values = this.__addValueProperty(
				Field,
				GeneratedField.selectOptions.name,
				GeneratedField.selectOptions.value,
				LabelGenerator
			);
		},
		_buildPick: function ( Field, GeneratedField, LabelGenerator )
		{
			if ( 'multipleItems' in Field && true === Field.multibleItems )
			{
				GeneratedField.type = 'checklist';
				if ( 'asList' in Field )
				{
					GeneratedField.listBox =
                        this.__executeFunctionOrGetBool( Field.asList, Field.name );
				}
				else
				{
					GeneratedField.listBox = false;
				}

				GeneratedField.checklistOptions = this.__addOptionProperty( Field );
				GeneratedField.values = this.__addValueProperty(
					Field,
					GeneratedField.checklistOptions.name,
					GeneratedField.checklistOptions.value,
					LabelGenerator
				);
			}
			else
			{
				GeneratedField.type = 'checkbox';
				this.__addAutocompleteProperty( Field, GeneratedField );
			}
		},
		_buildTextBlock: function ( Field, GeneratedField, LabelGenerator )
		{
			GeneratedField.type = 'textarea';
			this.__addAutocompleteProperty( Field, GeneratedField );
			this.__assignOptionalFieldBoolean( Field, GeneratedField, 'readonly' );
			this.__assignOptionalEmptyStringOrLabelString(
				LabelGenerator,
				Field,
				GeneratedField,
				'briefDescription',
				'placeholder'
			);
			this.__assignOptionalFieldNumeric( Field, GeneratedField, 'maximum', 'max' );
			this.__assignOptionalFieldNumeric( Field, GeneratedField, 'minimum', 'min' );
			this.__assignOptionalFieldNumeric( Field, GeneratedField, 'rows' );
		},
		_buildSubmit: function ( Field, GeneratedField, LabelGenerator )
		{
			let Mutable;
			this.__assignOptionalFieldFunction( Field, GeneratedField, 'onSubmit' );
			this.__assignOptionalFieldBoolean( Field, GeneratedField, 'validateBeforeSubmit' );
			if ( 'label' in Field )
			{
				Mutable = this.__executeFunctionOrGetString( Field.label, Field.name );
				GeneratedField.buttonText = this.__getStringLabelOrPlaceholder(
					LabelGenerator,
					Mutable
				);
			}
			else
			{
				GeneratedField.buttonText = this.__getStringLabelOrPlaceholder(
					LabelGenerator,
					Field.name
				);
			}

			this.__assignOptionalFieldBoolean( Field, GeneratedField, 'isVisible', 'visible' );
			this.__assignOptionalFieldBoolean( Field, GeneratedField, 'isDisabled', 'disabled' );
		},
		__addCommonRequiredProperties: function ( Field, GeneratedField, LabelGenerator )
		{
			let Mutable;
			if ( 'label' in Field )
			{
				Mutable = this.__executeFunctionOrGetString( Field.label, Field.name );
				GeneratedField.label = this.__getStringLabelOrPlaceholder(
					LabelGenerator,
					Mutable
				);
			}
			else
			{
				GeneratedField.label = this.__getStringLabelOrPlaceholder(
					LabelGenerator,
					Field.name
				);
			}

			if ( 'storesIn' in Field )
			{
				if ( 'prefix' in Field )
				{
					GeneratedField.model = `${Field.prefix }.
					                        ${ this.__executeFunctionOrGetString( Field.storesIn, Field.Name ) }`;
				}
				else
				{
					GeneratedField.model = this.__executeFunctionOrGetString(
						Field.storesIn,
						Field.Name
					);
				}
			}
			else
			{
				if ( 'prefix' in Field )
				{
					GeneratedField.model = `${Field.prefix }.${ Field.name}`;
				}
				else
				{
					GeneratedField.model = Field.name;
				}
			}
		},
		__addCommonOptionalProperties: function ( Field, GeneratedField, LabelGenerator )
		{
			let Mutable;
			this.__assignOptionalFieldBoolean( Field, GeneratedField, 'isVisible', 'visible' );
			this.__assignOptionalFieldBoolean( Field, GeneratedField, 'isDisabled', 'disabled' );
			this.__assignOptionalFieldBoolean( Field, GeneratedField, 'isFeatured', 'featured' );
			this.__assignOptionalFieldBoolean( Field, GeneratedField, 'isRequired', 'required' );
			this.__assignOptionalFieldString( Field, GeneratedField, 'defaultValue', 'default' );

			if ( 'styleClasses' in Field )
			{
				if ( false === Array.isArray( Field.styleClasses ) && 'string' !== typeof Field.styleClasses )
				{
					throw new InvalidFieldException(
						StringHelper.format(
							ErrorMessages.UNSUPPORTED_TYPE,
							typeof Field.styleClasses,
							Field.name,
							' at styleClasses property',
							'array of strings or string'
						)
					);

				}
				else if ( true === Array.isArray( Field.styleClasses ) )
				{
					for ( Mutable in Field.styleClasses )
					{
						if ( 'string' !== typeof Field.styleClasses[ Mutable ] )
						{
							throw new InvalidFieldException(
								StringHelper.format(
									ErrorMessages.UNSUPPORTED_TYPE,
									typeof Field.styleClasses[ Mutable ],
									Field.name,
									` at styleClasses property at Index ${Mutable}`,
									'string'
								)
							);
						}
					}
				}
			}

			this.__assignOptionalPlaceholderOrLabelString( LabelGenerator, Field, GeneratedField, 'help' );
			this.__assignOptionalPlaceholderOrLabelString( LabelGenerator, Field, GeneratedField, 'hint' );

			if ( 'buttons' in Field )
			{
				GeneratedField.buttons = this.__addButtons(
					Field.buttons,
					Field.name,
					LabelGenerator
				);
			}

			this.__assignOptionalFieldFunction( Field, GeneratedField, 'setFormatter', 'set' );
			this.__assignOptionalFieldFunction( Field, GeneratedField, 'getFormatter', 'get' );
			this.__assignOptionalFieldFunction( Field, GeneratedField, 'afterChanged', 'onChanged' );
			this.__assignOptionalFieldFunction( Field, GeneratedField, 'afterValidated' );
		},
		_buildField: function ( Field, LabelGenerator )
		{
			const GeneratedField = {};

			if ( 'class' in Field )
			{
				Field.styleClasses = Field.class;
				delete Field.class;
			}

			// common required properties
			if ( 'prefix' in Field )
			{
				if ( 'string' !== Field.prefix )
				{
					throw new InvalidFieldException(
						StringHelper.format(
							ErrorMessages.UNSUPPORTED_TYPE,
							typeof Field.prefix,
							Field.name,
							'at prefix',
							'string'
						)
					);
				}
			}

			if ( 'name' in Field )
			{
				if ( 'prefix' in Field )
				{
					GeneratedField.id = `${Field.prefix }.${ Field.name}`;
				}
				else
				{
					GeneratedField.id = Field.name;
				}
			}
			else
			{
				throw new InvalidFieldException( ErrorMessages.NO_NAME );
			}
			// specific  properties
			Field.type = Field.type.toLowerCase();
			if ( 'choise' === Field.type )
			{
				this._buildChoice( Field, GeneratedField, LabelGenerator );
			}
			else if ( 'select' === Field.type )
			{
				this._buildSelect( Field, GeneratedField, LabelGenerator );
			}
			else if ( 'pick' === Field.type )
			{
				this._buildPick( Field, GeneratedField, LabelGenerator );
			}
			else if ( 'textBlock' === Field.type )
			{
				this._buildTextBlock( Field, GeneratedField, LabelGenerator );
			}
			else if ( 'submit' === Field.type )
			{
				this._buildSubmit( Field, GeneratedField, LabelGenerator );
				return GeneratedField;
			}
			/* futher types should be placed here */ else
			{
				if ( 'label' !== Field.type )
				{
					this._buildInputField( Field, GeneratedField, LabelGenerator );
				}
			}

			this.__addCommonRequiredProperties( Field, GeneratedField, LabelGenerator );
			this.__addCommonOptionalProperties( Field, GeneratedField, LabelGenerator );

			return GeneratedField;
		},
		_buildModel: function ( FieldModel, MultipleValues = false )
		{
			let Chunks, Index;

			let Self = this.$data.blubberModel[ this.$data.currentFormId ];

			if ( true === FieldModel.includes( '.' ) )
			{
				Chunks = FieldModel.split( '.' );
				for ( Index in Chunks )
				{
					if ( Chunks[ Index ] in Self )
					{
						Self = Self[ Chunks[ Index ] ];
					}
					else
					{
						Self[ Chunks[ Index ] ] = {};
						Self = Self[ Chunks[ Index ] ];
					}
				}

				if ( true === MultipleValues )
				{
					Self[ Chunks[ Chunks.length - 1 ] ] = [];
				}
				else
				{
					Self[ Chunks[ Chunks.length - 1 ] ] = '';
				}
			}
			else
			{
				if ( true === MultipleValues )
				{
					Self[ FieldModel ] = [];
				}
				else
				{
					Self[ FieldModel ] = '';
				}
			}
		},
		_buildGroup: function ( Group, LabelGenerator )
		{
			let Index, Mutable;
			const GeneratedGroup = {};
			if ( 'name' in Group )
			{
				GeneratedGroup.legend =
                    this.__getStringLabelOrPlaceholder( LabelGenerator, Group.name );
				GeneratedGroup.id = Group.name;
			}
			else
			{
				throw new InvalidFieldException( ErrorMessages.NO_NAME );
			}

			GeneratedGroup.fields = [];
			for ( Index in Group.group )
			{
				if ( 'prefix' in Group && false === ( 'prefix' in Group.group[ Index ] ) )
				{
					Group.fields[ Index ].prefix = Group.prefix;
				}

				Mutable = this._buildField( Group.group[ Index ], LabelGenerator );
				this._buildModel( Mutable.model );
				GeneratedGroup.fields.push( Mutable );
			}

			return GeneratedGroup;
		},
		_buildDynamicField: function ( Field, LabelGenerator )
		{
			let GeneratedFields = {};
			this.__assignOptionalFieldFunction( Field, GeneratedFields, 'bind' );
			GeneratedFields = GeneratedFields.bind();
			if ( true === Array.isArray( GeneratedFields ) )
			{
				if ( 'prefix' in Field )
				{
					return [
						this._buildFields(
							GeneratedFields,
							LabelGenerator,
							Field.prefix
						),
						null,
						null
					];
				}
				else
				{
					return [
						this._buildFields(
							GeneratedFields,
							LabelGenerator
						),
						null,
						null
					];
				}
			}
			else
			{
				if ( 'prefix' in Field )
				{
					GeneratedFields.prefix = Field.prefix;
				}

				if ( 'group' in GeneratedFields )
				{
					return [ null, this._buildGroup( GeneratedFields, LabelGenerator ), null ];
				}
				else
				{
					return [ null, null, this._buildField( GeneratedFields, LabelGenerator ) ];
				}
			}
		},
		_buildFields: function ( Fields, LabelGenerator )
		{
			let GeneratedFields = [];
			const GeneratedGroups = [];
			const Model = {};
			const Return = {};
			let FieldIndex, Mutable;

			for ( FieldIndex in Fields )
			{
				if ( 'bind' in Fields[ FieldIndex ] )
				{
					Mutable = this._buildDynamicField(
						Fields[ FieldIndex ],
						Model,
						LabelGenerator
					);
					if ( null === Mutable[ 1 ] && null === Mutable[ 2 ] )
					{
						GeneratedFields = GeneratedFields.concat( Mutable );
					}
					else if ( null === Mutable[ 0 ] && null === Mutable[ 2 ] )
					{
						GeneratedGroups.push( Mutable );
					}
					else
					{
						Mutable = this._buildField( Fields[ FieldIndex ], LabelGenerator );
						if ( 'multi' in Mutable )
						{
							this._buildModel( Mutable.model, Mutable.multi );
						}
						else
						{
							this._buildModel( Mutable.model );
						}

						GeneratedFields.push( Mutable );
					}
					continue;
				}

				if ( 'group' in Fields[ FieldIndex ] )
				{
					GeneratedGroups.push(
						this._buildGroup( Fields[ FieldIndex ], LabelGenerator )
					);
					continue;
				}

				Mutable = this._buildField( Fields[ FieldIndex ], LabelGenerator );
				if ( 'multi' in Mutable )
				{
					this._buildModel( Mutable.model, Mutable.multi );
				}
				else
				{
					this._buildModel( Mutable.model );
				}

				GeneratedFields.push( Mutable );
			}

			if ( false === ObjectHelper.isEmpty( GeneratedFields ) )
			{
				Return.fields = GeneratedFields;
			}

			if ( false === ObjectHelper.isEmpty( GeneratedGroups ) )
			{
				Return.groups = GeneratedGroups;
			}

			return Return;
		},
		__addDescription: function ( createElement, Step, LabelGenerator )
		{
			const DescriptionText = this.__getStringLabelOrPlaceholder(
				LabelGenerator,
				Step.description
			);
			if ( false === StringHelper.isEmpty( DescriptionText ) )
			{
				return createElement( 'div',
					{
						attr: {
							'class': 'blubberDescription',
							id: Step.description
						},
						domProps: {
							innerHTML: DescriptionText
						}
					} );
			}
			else
			{
				return '';
			}
		},
		__buildVueGenerator: function ( createElement, Step, LabelGenerator )
		{
			let Options;
			const Index = this.$data.blubberFormSchema[ this.$data.currentFormId ].length;
			const GeneratedStep = this._buildFields( Step.fields, LabelGenerator );
			this.$data.blubberFormSchema[ this.$data.currentFormId ].push( GeneratedStep );

			if ( 'options' in Step )
			{
				Options = Step.options;
			}
			else
			{
				Options = {};
			}

			return createElement(
				'vue-form-generator',
				{
					props: {
						model: this.$data.blubberModel[ this.$data.currentFormId ],
						schema: this.$data.blubberFormSchema[ this.$data.currentFormId ][ Index ],
						options: Options,
						ref: StringHelper.format( '{}_{}', this.$data.currentFormId, Index )
					}
				} );
		},
		_buildStep: function ( createElement, Step, LabelGenerator )
		{
			let Title, Icon, Mutable;
			const BeforeChange = {};
			const Description = this.__addDescription( createElement, Step, LabelGenerator );
			const VueGenerator = this.__buildVueGenerator( createElement, Step, LabelGenerator );

			if ( 'label' in Step )
			{
				Mutable = this.__executeFunctionOrGetString( Step.label, Step[ '"name"' ] );
				Title = this.__getStringLabelOrPlaceholder( LabelGenerator, Mutable );
			}
			else
			{
				Title = this.__getStringLabelOrPlaceholder( LabelGenerator, Step.name );
			}

			if ( 'icon' in Step )
			{
				Icon = Step.icon;
			}
			else
			{
				Icon = '';
			}

			if ( 'beforeChange' in Step )
			{
				this.__assignOptionalFieldFunction( Step, BeforeChange, 'beforeChange' );
				return createElement( 'tab-content',
					{
						attr: {
							id: Step.name
						},
						props: {
							title: Title,
							icon: Icon,
							beforeChange: BeforeChange.beforeChange
						}
					},
					[ Description, VueGenerator ]
				);
			}
			else
			{
				return createElement( 'tab-content',
					{
						attr: {
							id: Step.name
						},
						props: {
							title: Title,
							icon: Icon
						}
					},
					[ Description, VueGenerator ]
				);
			}

		},
		buildBlubberForm: function (
			createElement,
			FormId,
			FormAttributes,
			FormProperties,
			Steps,
			LabelGenerator
		)
		{
			let StepIndex, LabelString, LabelIndex;
			const Tabs = [];
			// set formproperties and add labels
			const FormPropertiesLabels = [ 'subtitle', 'nextButtonText', 'backButtonText', 'finishButtonText' ];

			if ( 'string' !== typeof FormId || true === StringHelper.isEmpty( FormId ) )
			{
				throw new TypeErrorException(
					StringHelper.format(
						ErrorMessages.IVALID_TOP_ITEM,
						'FormId',
						typeof FormId,
						'non empty string'
					)
				);

			}

			if ( 'function' !== typeof LabelGenerator )
			{
				throw new TypeErrorException(
					StringHelper.format(
						ErrorMessages.IVALID_TOP_ITEM,
						'LabelGenerator',
						typeof LabelGenerator,
						'function'
					)
				);

			}

			if ( 'object' !== typeof FormAttributes )
			{
				FormAttributes = { id: FormId };
			}
			else
			{
				FormAttributes.id = FormId;
			}

			for ( LabelIndex in FormPropertiesLabels )
			{
				LabelString = this.__getStringLabelOrPlaceholder(
					LabelGenerator,
					FormProperties[ FormPropertiesLabels[ LabelIndex ] ],
					FormProperties );
				FormProperties[ FormPropertiesLabels[ LabelIndex ] ] = LabelString;
			}

			this.$data.blubberFormSchema[ FormId ] = [];
			this.$data.blubberModel[ FormId ] = {};
			this.$data.currentFormId = FormId;

			for ( StepIndex in Steps )
			{
				Tabs.push( this._buildStep( createElement, Steps[ StepIndex ], LabelGenerator ) );
			}

			return createElement( 'form-wizard', {
				attrs: FormAttributes,
				props: FormProperties
			}, Tabs );

		}
	},
	data: function ()
	{
		return { currentFormId: '', blubberModel: {}, blubberFormSchema: {} };
	}
};

export default BlubberFormFactory;