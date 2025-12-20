import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: { createdAt: 'created_at' } })
export class Transcript {

    @Prop({ required: true })
    text: string;

    @Prop({ type: Number, default: null })
    confidence?: number;

    @Prop({ default: 'default-ml-model' })
    model_name: string;

    @Prop({ default: 'en' })
    language: string;

    @Prop({ type: Number, default: 0 })
    audio_duration: number;
}

export const TranscriptSchema = SchemaFactory.createForClass(Transcript);
TranscriptSchema.index({ created_at: -1 });
